// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';
import { LoginButton } from './components/LoginButton';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.log('getUser error:', error.message);
      }

      setUser(user ?? null);
      setLoading(false);
    };

    init();

    // ログイン / ログアウトなどセッション変化を監視
    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        ローカル Google OAuth テスト（クライアント版）
      </h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : user ? (
        <div>
          <p>ログイン中: {user.email}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border rounded"
            style={{ marginTop: '1rem' }}
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div>
          <p>まだログインしていません。</p>
          <LoginButton />
        </div>
      )}
    </main>
  );
}
