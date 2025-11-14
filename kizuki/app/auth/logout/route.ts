// app/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Supabase のセッション（Cookie）を削除
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);

  // ログアウト後はトップページへリダイレクト
  return NextResponse.redirect(`${origin}/`);
}
