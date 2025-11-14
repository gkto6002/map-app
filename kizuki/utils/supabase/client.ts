// utils/supabase/client.ts
'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 完全クライアントサイド用の Supabase クライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // ブラウザにセッションを保存
    detectSessionInUrl: true,   // リダイレクトURLからセッションを検出
    flowType: 'pkce',           // 推奨の PKCE フロー
  },
});
