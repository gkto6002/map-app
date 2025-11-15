// app/map/page.tsx
import MapView from "../components/MapView";
import PostButton from "../components/PostButton";
import SpotsList from "../components/SpotsList";
import LogoutButton from "../components/LogoutButton";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function MapPage() {
  // server-side auth check: redirect to / if not signed in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userId = user?.id;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Kizuki マップ</h1>
            <p className="mt-1 text-sm text-gray-500">街の気づきをすばやく共有・発見するマップアプリ</p>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </header>

        {/* Layout: map + sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <div className="rounded-lg shadow-sm bg-white overflow-hidden">
              <MapView />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">過去の投稿一覧</h2>
              <div className="mt-3">
                <SpotsList userId={userId} />
              </div>
            </div>
          </aside>
        </div>

        {/* Floating post button */}
        <PostButton userId={userId} />
      </div>
    </main>
  );
}
