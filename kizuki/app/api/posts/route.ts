// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { prisma } from "@/app/lib/prisma";
import type { ApiPost, NewPostRequestBody } from "@/app/types/posts";

// Supabase（サーバー側）クライアントを作るヘルパー
async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Next.js 15 の async cookies API

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );
}

// -----------------------------
// POST /api/posts  新規投稿
// -----------------------------
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // ① ログインユーザー取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("auth error:", authError);
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ② リクエストボディ
    const json = (await req.json()) as NewPostRequestBody;
    const { title, body, latitude, longitude, images } = json;

    if (
      typeof title !== "string" ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return NextResponse.json(
        { error: "title, latitude, longitude は必須" },
        { status: 400 }
      );
    }

    // ③ プロフィールを必ず作っておく（外部キー対策）
    //    profiles.userId が PK なので、この upsert で必ず1行存在する状態になる
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {}, // 今は特に更新する項目なし
      create: {
        userId: user.id,
        // displayName はあとで設定できるようにしてもいい
        // displayName: user.email ?? null,
      },
    });

    // ④ 投稿＋画像を作成
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title,
        body: body ?? "",
        latitude,
        longitude,
        images:
          images && images.length > 0
            ? {
                createMany: {
                  data: images.map((img, idx) => ({
                    path: img.path,
                    mime: img.mime,
                    width: img.width,
                    height: img.height,
                    sizeBytes: BigInt(img.sizeBytes),
                    sortOrder: img.sortOrder ?? idx,
                  })),
                },
              }
            : undefined,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(post satisfies ApiPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// -----------------------------
// GET /api/posts  全投稿取得
// -----------------------------
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(posts as ApiPost[]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
