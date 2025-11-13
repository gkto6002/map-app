'use client';

import { createClient } from '@/utils/supabase/client';

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ローカル用のコールバック
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded border"
    >
      Googleでログイン
    </button>
  );
}
