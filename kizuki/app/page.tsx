// app/page.tsx
import { LoginButton } from './components/LoginButton';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン済みなら /map へ
  if (user) {
    redirect('/map');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        background:
          'radial-gradient(circle at top, #e0f2fe 0, #f9fafb 40%, #e5e7eb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 画面中央のカード */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '1.25rem',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '2rem',
          boxSizing: 'border-box',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* ロゴっぽい丸 */}
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            background:
              'linear-gradient(135deg, #38bdf8 0%, #4f46e5 50%, #22c55e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          K
        </div>

        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: '#111827',
          }}
        >
          KizukiMap にログイン
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#4b5563',
            marginBottom: '1.75rem',
            lineHeight: 1.6,
          }}
        >
          Google アカウントでサインインして、
          <br />
          地図上に気づきを投稿・共有できます。
        </p>

        {/* 区切り線 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '0.75rem',
            color: '#9ca3af',
            fontSize: '0.75rem',
          }}
        >
          <div
            style={{
              height: '1px',
              flex: 1,
              background:
                'linear-gradient(to right, transparent, #e5e7eb, transparent)',
            }}
          />
          <span>Google アカウントで続行</span>
          <div
            style={{
              height: '1px',
              flex: 1,
              background:
                'linear-gradient(to right, transparent, #e5e7eb, transparent)',
            }}
          />
        </div>

        {/* ログインボタン（中身は今までどおり LoginButton に任せる） */}
        <div style={{ marginBottom: '1.5rem' }}>
          <LoginButton />
        </div>

        {/* フッター説明 */}
        <div
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            lineHeight: 1.6,
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            ・メールアドレスなどの認証情報は Supabase Auth で安全に管理されます。
          </p>
          <p>
            ・このアプリはテスト用のプロトタイプです。投稿内容は開発用データベースに保存されます。
          </p>
        </div>
      </div>
    </main>
  );
}
