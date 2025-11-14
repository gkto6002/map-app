'use client';

import { supabase } from '@/utils/supabase/client';

export function LoginButton() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // redirectTo を指定しない → Supabase の Site URL (http://localhost:3000) に戻る
      // options: { redirectTo: `${window.location.origin}` },
    });

    if (error) {
      console.error('OAuth error:', error);
    } else {
      console.log('OAuth redirecting...', data);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 border rounded"
    >
      Googleでログイン
    </button>
  );
}
