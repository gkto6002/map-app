// app/components/MapView.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const postMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  type Spot = {
    id: string;
    title: string;
    description?: string;
    lat: number;
    lng: number;
    image_url?: string;
    created_at?: string;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is not set");
      return;
    }

    if (mapRef.current) return; // already initialized

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [139.7004, 35.6595],
      zoom: 15,
    });

    mapRef.current = map;

    // try to center on current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          new mapboxgl.Marker({ color: "#1d4ed8" })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setText("現在地"))
            .addTo(map);
          map.flyTo({ center: [lng, lat], zoom: 14 });
        },
        () => {
          // ignore
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // click to place a post marker (keeps previous behavior)
    map.on("click", (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      if (postMarkerRef.current) postMarkerRef.current.remove();
      postMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    // fetch spots from API and render markers
    const fetchAndRender = async () => {
      try {
        const res = await fetch("/api/spots");
        if (!res.ok) throw new Error(`fetch spots failed: ${res.status}`);
        const data = await res.json();
        const spots = Array.isArray(data) ? data : data.data ?? [];

        // clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

  spots.forEach((spot: Spot) => {
          const dotSize = 14;
          const dot = document.createElement("div");
          dot.style.width = `${dotSize}px`;
          dot.style.height = `${dotSize}px`;
          dot.style.borderRadius = "999px";
          dot.style.backgroundColor = "#2563eb";
          dot.style.border = "2px solid white";
          dot.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
          dot.style.boxSizing = "border-box";

          const label = document.createElement("div");
          label.textContent = spot.title;
          label.style.fontSize = "11px";
          label.style.padding = "2px 6px";
          label.style.borderRadius = "999px";
          label.style.backgroundColor = "rgba(255,255,255,0.95)";
          label.style.boxShadow = "0 0 4px rgba(0,0,0,0.2)";
          label.style.whiteSpace = "nowrap";
          label.style.maxWidth = "160px";
          label.style.textOverflow = "ellipsis";
          label.style.overflow = "hidden";
          label.style.color = "#000";
          label.style.pointerEvents = "auto";
          label.style.cursor = "pointer";

          const imageBlock = spot.image_url
            ? `<div style="margin-bottom:6px"><img src="${spot.image_url}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px"/></div>`
            : "";

          const popupHtml = `
            <div style="font-size:13px;max-width:260px;color:#000">
              <div style="font-weight:600;margin-bottom:4px">${spot.title}</div>
              ${imageBlock}
              <div style="margin-bottom:4px">${spot.description ?? ""}</div>
              <div style="font-size:11px;color:#666">${spot.created_at ?? ""}</div>
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml);

          const dotMarker = new mapboxgl.Marker({ element: dot, anchor: "center" })
            .setLngLat([spot.lng, spot.lat])
            .setPopup(popup)
            .addTo(map);

          const labelOffsetX = Math.round(dotSize / 2) + 8;
          new mapboxgl.Marker({ element: label, anchor: "left" })
            .setLngLat([spot.lng, spot.lat])
            .setOffset([labelOffsetX, 0])
            .addTo(map);

          label.addEventListener("click", (e) => {
            e.stopPropagation();
            try {
              const p = dotMarker.getPopup?.();
              if (p) p.addTo(map);
            } catch {
              // noop
            }
          });

          markersRef.current.push(dotMarker);
        });
      } catch (err) {
        console.error("load spots failed", err);
      }
    };

    fetchAndRender();

    return () => {
      // remove spot markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-[80vh]">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
}