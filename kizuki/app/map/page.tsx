// app/map/page.tsx
import MapView from "../components/MapView";
import PostButton from "../components/PostButton";
import SpotsList from "../components/SpotsList";

export default function MapPage() {
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
      <PostButton />


      {/* --- Supabase から取得したスポット一覧 --- */}
      <div>
        <h2 className="text-lg font-semibold mb-2">登録済みスポット一覧</h2>
        <SpotsList />
      </div>
    </main>
  );
}
