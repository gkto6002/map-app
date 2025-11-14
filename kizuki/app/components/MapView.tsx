// app/components/MapView.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { dummyPosts } from "../utils/dummyPosts";

mapboxgl.accessToken = process.env
  .NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is not set");
      return;
    }

    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [139.7004, 35.6595],
      zoom: 15,
    });

    mapRef.current = map;

    // ラベル付きマーカー（文字色黒）
    dummyPosts.forEach((post) => {
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "4px";

      const dot = document.createElement("div");
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "999px";
      dot.style.backgroundColor = "#2563eb";
      dot.style.border = "2px solid white";
      dot.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";

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
      label.style.color = "#000"; // ★ ラベル文字色を黒

      wrapper.appendChild(dot);
      wrapper.appendChild(label);

      // ★ ポップアップ HTML（文字色を黒に統一）
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

      new mapboxgl.Marker({ element: wrapper })
        .setLngLat([post.lng, post.lat])
        .setPopup(popup)
        .addTo(map);
    });

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
