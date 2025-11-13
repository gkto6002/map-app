import dynamic from "next/dynamic";

// クライアントコンポーネントを動的に読み込む（placeholder を表示）
const Map = dynamic(() => import("./components/MapClient"), {
  loading: () => <p>Loading map...</p>,
});

export default function Home() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="h-4/5 w-4/5">
        <Map />
      </div>
    </div>
  );
}