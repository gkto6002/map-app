// app/page.tsx
import { LoginButton } from './components/LoginButton';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        ローカル Google OAuth テスト
      </h1>

      {user ? (
        <div>
          <p>ログイン中: {user.email}</p>

          {/* ログアウト用フォーム（/auth/logout に POST） */}
          <form
            action="/auth/logout"
            method="post"
            style={{ marginTop: '1rem' }}
          >
            <button
              type="submit"
              className="px-4 py-2 border rounded"
            >
              ログアウト
            </button>
          </form>
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
