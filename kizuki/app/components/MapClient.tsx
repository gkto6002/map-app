"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import type { Marker as LeafletMarker } from "leaflet";

// Leaflet のデフォルトアイコンを修正
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapClient = () => {
  const [userPosition, setUserPosition] = useState<[number, number]>([35.6895, 139.6917]); // 初期値は東京

  const dummyPosts = [
    {
      id: "p1",
      title: "公園の落書き",
      body: "きれいなベンチの近くに面白い落書きを見つけました。",
      image: "https://picsum.photos/seed/p1/300/180",
      position: [35.6898, 139.6920],
    },
    {
      id: "p2",
      title: "おすすめカフェ",
      body: "小さな路地裏にある隠れ家カフェ。ラテが美味しい。",
      image: "https://picsum.photos/seed/p2/300/180",
      position: [35.6885, 139.6900],
    },
    {
      id: "p3",
      title: "夕焼けスポット",
      body: "ここからの夕焼けは最高です。写真撮影におすすめ。",
      image: "https://picsum.photos/seed/p3/300/180",
      position: [35.6910, 139.6930],
    },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // 表示モード: 'popup' はポップアップを開く、'label' は常時表示のラベル（Tooltip）
  const [displayMode, setDisplayMode] = useState<"popup" | "label">("label");

  // マーカーの ref を保持
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  useEffect(() => {
    if (displayMode !== "popup") return;
    const t = setTimeout(() => {
      Object.keys(markerRefs.current).forEach((id) => {
        const m = markerRefs.current[id];
        if (!m) return;
        // Leaflet instance may have openPopup
        // @ts-ignore
        if (typeof m.openPopup === "function") {
          // @ts-ignore
          m.openPopup();
        }
      });
    }, 500);
    return () => clearTimeout(t);
  }, [displayMode]);

  return (
    <MapContainer center={userPosition} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* ユーザーの現在地 */}
      <Marker position={userPosition as [number, number]}>
        <Popup>
          <strong>あなたの現在地</strong>
        </Popup>
      </Marker>

      {/* 切替 UI（ポップアップ表示 / ラベル表示） */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000 }}>
        <div style={{ background: "white", padding: 8, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <button
            onClick={() => setDisplayMode("popup")}
            style={{ marginRight: 8, padding: "6px 8px", background: displayMode === "popup" ? "#2563eb" : "#eee", color: displayMode === "popup" ? "white" : "black", border: "none", borderRadius: 4 }}
          >
            Popups
          </button>
          <button
            onClick={() => setDisplayMode("label")}
            style={{ padding: "6px 8px", background: displayMode === "label" ? "#2563eb" : "#eee", color: displayMode === "label" ? "white" : "black", border: "none", borderRadius: 4 }}
          >
            Labels
          </button>
        </div>
      </div>

      {/* ダミーポストをマップに配置 */}
      {dummyPosts.map((post) => (
        <Marker
          key={post.id}
          position={post.position as [number, number]}
          ref={(el) => {
            if (el) markerRefs.current[post.id] = el as unknown as LeafletMarker;
          }}
        >
            {/* ラベルモードならツールチップを常時表示（クリックでPopupも開く） */}
            {displayMode === "label" && (
              <Tooltip direction="top" permanent>
                <div style={{ maxWidth: 200 }}>
                  <strong style={{ display: "block" }}>{post.title}</strong>
                  <div style={{ fontSize: 12 }}>{post.body}</div>
                </div>
              </Tooltip>
            )}

            {/* クリック時に表示するポップアップ（画像など詳細） */}
            <Popup>
              <div style={{ maxWidth: 240 }}>
                <h3 style={{ margin: 0 }}>{post.title}</h3>
                <p style={{ margin: "6px 0" }}>{post.body}</p>
                {post.image && (
                  <img src={post.image} alt={post.title} style={{ width: "100%", borderRadius: 6 }} />
                )}
              </div>
            </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapClient;
