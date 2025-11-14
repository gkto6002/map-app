// app/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("Missing Supabase URL (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)");
}
if (!anonKey) {
  throw new Error(
    "Missing Supabase anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY)"
  );
}
if (!serviceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

// ブラウザ/サーバー読み取り用
export const supabase = createClient(url, anonKey);

// サーバー管理用（seed など）
export const supabaseAdmin = createClient(url, serviceKey);
