// app/map/page.tsx
import MapView from "../components/MapView";

export default function MapPage() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Mapbox テスト</h1>
      <p className="mb-2 text-sm text-gray-500">
        地図をクリックするとマーカーが立ち、コンソールに緯度経度が出ます。
      </p>
      <MapView />
    </main>
  );
}
