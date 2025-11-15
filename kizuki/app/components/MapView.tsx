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
  const postModeRef = useRef<boolean>(false);
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

    // Start very zoomed out so the map feels like "space" and then fly in to current location
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      // center somewhere neutral and very zoomed out
      center: [0, 20],
      zoom: 0.6,
    });

    mapRef.current = map;

    // try to center on current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;

          // First stage: fly from 'space' to a regional zoom for dramatic effect
          map.flyTo({ center: [lng, lat], zoom: 3, speed: 0.6, curve: 1.4 });

          // After the first move completes, drop a marker and then zoom in further
          map.once("moveend", () => {
            try {
              new mapboxgl.Marker({ color: "#1d4ed8" })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup().setText("現在地"))
                .addTo(map);
            } catch {
              // noop
            }

            // Second stage: close in to the final zoom
            map.flyTo({ center: [lng, lat], zoom: 14, speed: 2.0, curve: 1.3 });
          });
        },
        () => {
          // ignore
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // click to place a post marker only when post-mode is enabled
    const onMapClick = (e: unknown) => {
      const ev = e as { lngLat?: { lng: number; lat: number } };
      const lng = ev.lngLat?.lng as number | undefined;
      const lat = ev.lngLat?.lat as number | undefined;
      if (typeof lng !== "number" || typeof lat !== "number") return;

      if (!postModeRef.current) {
        // normal interaction: ignore for post placement
        return;
      }

      // place or move the red post marker
      if (postMarkerRef.current) postMarkerRef.current.remove();
      postMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([lng, lat])
        .addTo(map);

      // dispatch a global event so the post modal / button can react
      window.dispatchEvent(new CustomEvent("post-location-selected", { detail: { lat, lng } }));
      // also ask UI to open the post modal (defensive: some listeners may prefer this)
      window.dispatchEvent(new CustomEvent("open-post-modal", { detail: { lat, lng } }));

      // exit post mode after one selection
      postModeRef.current = false;
    };
    map.on("click", onMapClick);

    // listen for the global signal to enter post selection mode
    const enableHandler = () => {
      postModeRef.current = true;
    };
    window.addEventListener("post-mode-enable", enableHandler as EventListener);

    // fetch spots from API and render markers (expects API to return array like: { id, title, body, latitude, longitude, created_at })
    const fetchAndRender = async () => {
      try {
        const res = await fetch("/api/spots");
        if (!res.ok) throw new Error(`fetch spots failed: ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.data ?? [];

        // map API shape to local Spot type
        const itemsArr = items as unknown as Array<Record<string, unknown>>;
        const spots: Spot[] = itemsArr
          .map((s) => {
            const idVal = s["id"];
            const titleVal = s["title"] ?? s["name"] ?? "";
            const descriptionVal = (s["body"] ?? s["description"]) as string | null | undefined;
            const latVal = Number(s["latitude"] ?? s["lat"]);
            const lngVal = Number(s["longitude"] ?? s["lng"]);
            const imageUrlVal = (s["image_url"] ?? null) as string | null;
            const createdAtVal = (s["created_at"] ?? null) as string | null;
            return {
              id: String(idVal),
              title: String(titleVal),
              description: descriptionVal ?? null,
              lat: latVal,
              lng: lngVal,
              image_url: imageUrlVal,
              created_at: createdAtVal ?? undefined,
            } as Spot;
          })
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

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

    // allow other parts of the UI to request a refresh after changes
    const refreshHandler = () => {
      try {
        if (postMarkerRef.current) {
          postMarkerRef.current.remove();
          postMarkerRef.current = null;
        }
      } catch {
        // noop
      }
      fetchAndRender();
    };

    const cancelHandler = () => {
      try {
        if (postMarkerRef.current) {
          postMarkerRef.current.remove();
          postMarkerRef.current = null;
        }
      } catch {
        // noop
      }
    };

    window.addEventListener("spots-updated", refreshHandler as EventListener);
    window.addEventListener("post-cancelled", cancelHandler as EventListener);

    return () => {
      window.removeEventListener("post-mode-enable", enableHandler as EventListener);
      window.removeEventListener("spots-updated", refreshHandler as EventListener);
      window.removeEventListener("post-cancelled", cancelHandler as EventListener);
      map.off("click", onMapClick);
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