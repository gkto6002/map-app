// app/components/MapView.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

type MapViewProps = {
  onLocationSelect?: (lng: number, lat: number) => void;
};

export default function MapView({ onLocationSelect }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const postMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // デフォルトは東京駅あたり
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [139.7671, 35.6812],
      zoom: 13,
    });

    // 現在地付近に飛ばす
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;

          // 現在地マーカー
          new mapboxgl.Marker({ color: "#1d4ed8" })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setText("現在地"))
            .addTo(mapRef.current!);

          mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
        },
        () => {
          // 失敗したらデフォルトのまま
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // クリックした場所に投稿用ピンを立てる
    mapRef.current.on("click", (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      // 以前のピンがあれば消す
      if (postMarkerRef.current) {
        postMarkerRef.current.remove();
      }

      postMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // 親に位置を返す（PostModal に渡す用）
      onLocationSelect?.(lng, lat);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onLocationSelect]);

  return <div ref={mapContainerRef} className="w-full h-[60vh] rounded-lg" />;
}
