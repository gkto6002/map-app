// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // もしクエリに next があれば、そのページに戻す（なければ /）
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/';
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ローカル開発ならそのまま origin に戻してOK
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // エラー時はとりあえずトップに戻す
  return NextResponse.redirect(`${origin}/`);
}
