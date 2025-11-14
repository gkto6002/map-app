import { NextResponse } from 'next/server';
// server用のクライアントをインポートします
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  console.log('[GET /api/posts] start');
  
  // サーバー用クライアントを作成
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // supabase-js may return HTML error pages in error.message when the host is unreachable
      const raw = String(error.message ?? '');
      console.error('[GET /api/posts] supabase error:', raw);
      const isHtml = raw.trim().startsWith('<') || raw.includes('<!DOCTYPE');
      const detail = isHtml ? 'Supabase returned an HTML error page (possible 5xx/timeout).' : raw;
      return NextResponse.json({ error: 'supabase_error', detail, raw: isHtml ? raw.slice(0, 800) : undefined }, { status: 502 });
    }

    console.log('[GET /api/posts] data:', data);
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    // network / unexpected errors
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
    const body = await req.json();
    const title = String(body.title ?? "");
    const b = body.body ?? body.description ?? null;
    const latitude = body.latitude ?? body.lat ?? null;
    const longitude = body.longitude ?? body.lng ?? null;

    // attach server-side authenticated user id if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!title || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'invalid_payload', detail: 'title, latitude and longitude are required' }, { status: 400 });
    }

    const insertPayload: Record<string, unknown> = {
      title,
      body: b,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    if (user && user.id) {
      insertPayload.user_id = user.id;
    }

    const { data, error } = await supabase.from('posts').insert([insertPayload]).select();
    if (error) {
      console.error('[POST /api/posts] supabase error:', error.message ?? error);
      return NextResponse.json({ error: 'supabase_error', detail: String(error.message ?? error) }, { status: 502 });
    }

    console.log('[POST /api/posts] inserted:', data);
    // notify client that spots/posts updated
    return NextResponse.json(data ?? [], { status: 201 });
  } catch (err) {
    console.error('[POST /api/posts] unexpected error:', err);
    return NextResponse.json({ error: 'unexpected_error', detail: String(err) }, { status: 500 });
  }
}