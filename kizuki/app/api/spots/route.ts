import { NextResponse } from 'next/server';
// server用のクライアントをインポートします
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  console.log('[GET /api/posts] start');
  
  // サーバー用クライアントを作成
  const supabase = await createClient();

  try {
    // 変更点: 画像データも一緒に取得するために post_images(*) を追加
    const { data, error } = await supabase
      .from('posts')
      .select('*, post_images(*)') 
      .order('created_at', { ascending: false });

    if (error) {
      const raw = String(error.message ?? '');
      console.error('[GET /api/posts] supabase error:', raw);
      const isHtml = raw.trim().startsWith('<') || raw.includes('<!DOCTYPE');
      const detail = isHtml ? 'Supabase returned an HTML error page (possible 5xx/timeout).' : raw;
      return NextResponse.json({ error: 'supabase_error', detail, raw: isHtml ? raw.slice(0, 800) : undefined }, { status: 502 });
    }

    // map post_images -> image_url (public URL) for convenience on the client
  const posts = (data ?? []) as Array<Record<string, unknown>>;
    const mapped = posts.map((p) => {
      const imgs = Array.isArray(p.post_images) ? p.post_images : [];
      let image_url: string | null = null;
      if (imgs.length > 0 && imgs[0]?.path) {
        try {
          // Attempt to use Supabase helper to build a public URL
          const pub = supabase.storage.from("post-images").getPublicUrl(imgs[0].path) as unknown as {
            data?: { publicUrl?: string };
            publicUrl?: string;
          };
          // getPublicUrl returns { data: { publicUrl } } or { publicUrl }
          image_url = pub?.data?.publicUrl ?? pub?.publicUrl ?? null;
        } catch {
          // fallback to manual public URL construction
          const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
          image_url = base ? `${base}/storage/v1/object/public/post-images/${imgs[0].path}` : null;
        }
      }

      return {
        ...p,
        image_url,
      };
    });

    return NextResponse.json(mapped, { status: 200 });
  } catch (err) {
    const raw = String(err instanceof Error ? err.message : err);
    console.error('[GET /api/posts] unexpected error:', raw);
    const isHtml = raw.trim().startsWith('<') || raw.includes('<!DOCTYPE');
    const detail = isHtml ? 'Supabase returned an HTML error page (possible 5xx/timeout).' : raw;
    return NextResponse.json({ error: 'unexpected_error', detail, raw: isHtml ? raw.slice(0, 800) : undefined }, { status: 502 });
  }
}

export async function POST(req: Request) {
  console.log('[POST /api/posts] start');
  const supabase = await createClient();

  try {
    // 変更点: JSONではなくFormDataとして受け取る
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const body = formData.get('body') as string; // または description
    const latStr = formData.get('latitude') as string;
    const lngStr = formData.get('longitude') as string;
    const imageFile = formData.get('image') as File | null;
    
    // クライアントから送られる画像サイズ情報（DB保存用）
    const widthStr = formData.get('width') as string;
    const heightStr = formData.get('height') as string;

    // ユーザー情報の取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!title || !latStr || !lngStr) {
      return NextResponse.json({ error: 'invalid_payload', detail: 'title, latitude and longitude are required' }, { status: 400 });
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);

    // 1. まず投稿(posts)を作成
    const insertPayload: Record<string, unknown> = {
      title,
      body: body || null,
      latitude,
      longitude,
    };

    if (user && user.id) {
      insertPayload.user_id = user.id;
    } else {
      // 認証必須にする場合はここでエラーを返しても良い
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([insertPayload])
      .select()
      .single(); // single()を使って1つのオブジェクトとして取得

    if (postError) {
      console.error('[POST /api/posts] post create error:', postError.message);
      return NextResponse.json({ error: 'supabase_error', detail: postError.message }, { status: 502 });
    }

    const newPost = postData;
    console.log('[POST /api/posts] post inserted:', newPost.id);

    // 2. 画像がある場合、Storageへのアップロードとpost_imagesへの保存を行う
    if (imageFile && newPost.id) {
      try {
        // ファイル名を生成 (例: user_id/timestamp_uuid.ext)
        // user.idがない場合は 'anonymous' などをプレフィックスにする
        const userIdPath = user?.id ?? 'anonymous';
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${userIdPath}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`;

        // A. Storageへアップロード
        const { error: uploadError } = await supabase.storage
          .from('post-images') // バケット名
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          // 画像アップロードに失敗しても、投稿自体は成功しているのでここでは落とさない選択もアリ
          // ですが、整合性を気にするならエラーハンドリングが必要です。
        } else {
          // B. DB(post_images)へメタデータを保存
          const { error: imgDbError } = await supabase
            .from('post_images')
            .insert({
              post_id: newPost.id,
              path: fileName,
              mime: imageFile.type,
              size_bytes: imageFile.size,
              width: parseInt(widthStr || '0'),
              height: parseInt(heightStr || '0'),
              sort_order: 0
            });

          if (imgDbError) {
            console.error('Image DB insert error:', imgDbError);
          } else {
            console.log('Image saved successfully');
          }
        }
      } catch (imgErr) {
        console.error('Image processing error:', imgErr);
      }
    }

    return NextResponse.json(newPost, { status: 201 });

  } catch (err) {
    console.error('[POST /api/posts] unexpected error:', err);
    return NextResponse.json({ error: 'unexpected_error', detail: String(err) }, { status: 500 });
  }
}