// app/components/MapView.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // CSSのインポートもお忘れなく
import { dummyPosts } from "../utils/dummyPosts";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is not set");
      return;
    }

    // マップの二重初期化を防ぐ
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [139.7004, 35.6595],
      zoom: 15,
    });

    mapRef.current = map;

    // マーカーの生成ループ
    dummyPosts.forEach((post) => {
  // --- マーカー要素の作成 ---
  // 青いドット（ピン本体）を単体の Marker 要素として作り、
  // これを緯度経度に直接紐づけることで "dot が座標を示す" ようにする。
  const dotSize = 14; // サイズを変数化
  const dot = document.createElement("div");
  dot.style.width = `${dotSize}px`;
  dot.style.height = `${dotSize}px`;
  dot.style.borderRadius = "999px";
  dot.style.backgroundColor = "#2563eb";
  dot.style.border = "2px solid white";
  dot.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
  dot.style.boxSizing = "border-box";

  // ラベル要素は別マーカーとして同じ座標に配置し、右側にオフセットする
  const label = document.createElement("div");
  label.textContent = post.title;
  label.style.fontSize = "11px";
  label.style.padding = "2px 6px";
  label.style.borderRadius = "999px";
  label.style.backgroundColor = "rgba(255,255,255,0.9)";
  label.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";
  label.style.whiteSpace = "nowrap";
  label.style.maxWidth = "160px";
  label.style.textOverflow = "ellipsis";
  label.style.overflow = "hidden";
  label.style.color = "#000";
  label.style.display = "inline-block";
  label.style.boxSizing = "border-box";
  // ラベルはクリック可能にして、クリック時にドットのポップアップを開くようにする
  label.style.pointerEvents = "auto";
  label.style.cursor = "pointer";

      // --- ポップアップの作成 ---
      const imageBlock = post.imageUrl
        ? `
          <div style="margin-bottom: 6px;">
            <img
              src="${post.imageUrl}"
              alt="${post.title}"
              style="
                width: 100%;
                max-height: 160px;
                object-fit: cover;
                border-radius: 8px;
              "
            />
          </div>
        `
        : "";

      const popupHtml = `
        <div style="font-size: 13px; max-width: 260px; color: #000;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #000;">
            ${post.title}
          </div>
          ${imageBlock}
          <div style="margin-bottom: 4px; color: #000;">
            ${post.body}
          </div>
          <div style="font-size: 11px; color: #000;">
            ${new Date(post.createdAt).toLocaleString("ja-JP")}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml);

      // --- ドットを座標に固定 ---
      const dotMarker = new mapboxgl.Marker({ element: dot, anchor: "center" })
        .setLngLat([post.lng, post.lat])
        .setPopup(popup)
        .addTo(map);

      // --- ラベルは同じ座標に置き、ドットの右側にピクセルオフセットする ---
      // オフセットはドット半分 + マージン程度
      const labelOffsetX = Math.round(dotSize / 2) + 8; // 8px マージン
      new mapboxgl.Marker({ element: label, anchor: "left" })
        .setLngLat([post.lng, post.lat])
        .setOffset([labelOffsetX, 0])
        .addTo(map);

      // ラベルをクリックしたらドットの Popup を開く
      label.addEventListener("click", (e) => {
        e.stopPropagation();
        try {
          const p = dotMarker.getPopup?.();
          if (p) p.addTo(map);
        } catch {
          // noop
        }
      });
    });

    // クリーンアップ関数
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-[80vh]">
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
      />
    </div>
  );
}