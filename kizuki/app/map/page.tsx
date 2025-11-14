// app/map/page.tsx
import MapView from "../components/MapView";
import PostButton from "../components/PostButton";
import SeedButton from "../components/SeedButton";
import SpotsList from "../components/SpotsList";
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

  console.log("MapPage render for user:", userId);

  return (
    <main className="min-h-screen p-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Mapbox テスト</h1>
        <p className="mb-2 text-sm text-gray-500">
          地図をクリックするとマーカーが立ち、コンソールに緯度経度が表示されます。
        </p>
      </div>

      {/* --- 地図表示 --- */}
      <MapView />

      {/* --- 投稿ボタン（既存） --- */}
      <PostButton userId={userId} />

      {/* --- ダミーデータ投入（開発用） --- */}
      <div>
        <h2 className="text-lg font-semibold mb-2">開発用：ダミーデータ登録</h2>
        <SeedButton />
      </div>

      {/* --- Supabase から取得したスポット一覧 --- */}
      <div>
        <h2 className="text-lg font-semibold mb-2">登録済みスポット一覧</h2>
        <SpotsList />
      </div>
    </main>
  );
}
