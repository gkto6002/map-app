// Minimal local fallback for createClient to avoid "module not found" compile error.
// Replace this with your real Supabase server client implementation (e.g. from '@/utils/supabase/server')
// when the module/path is available.
async function createClient() {
  return {
    auth: {
      async exchangeCodeForSession(code: string) {
        // This is a stubbed successful response so the callback flow can complete during development.
        // Implement the real exchange with Supabase in your actual server utility.
        return { error: null } as { error: null | Error };
      },
    },
  };
}