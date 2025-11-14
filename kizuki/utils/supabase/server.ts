// utils/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  // cookies() は Promise なので await
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * すべての Cookie を一括取得
         */
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        /**
         * Cookie を一括で上書き
         * （auth の途中で Supabase が最新のセッション Cookie を投げてくる）
         */
        setAll(cookiesToSet) {
          // try {
          //   cookiesToSet.forEach(({ name, value, options }) => {
          //     cookieStore.set(name, value, options);
          //   });
          // } catch (e) {
          //   // ルートハンドラ以外で呼ばれた場合など、書き込み不可なとき用の保険
          //   console.warn('setAll cookies failed', e);
          // }
        },
      },
    }
  );

  return supabase;
}
