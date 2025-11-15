"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Spot = {
  id: string;
  title: string;
  description: string | null;
  body?: string | null;
  // API may return `latitude`/`longitude` or older `lat`/`lng` keys. Support both.
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  image_url: string | null;
  created_at: string;
};

export default function SpotsList({ userId }: { userId?: string }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchSpots = async () => {
        try {
          const url = userId ? `/api/spots?user_id=${encodeURIComponent(userId)}` : "/api/spots";
          const res = await fetch(url);
          const data = await res.json();

          // normalize different possible response shapes without using `any`
          const payload = data as unknown;
          if (Array.isArray(payload)) {
            setSpots(payload as Spot[]);
          } else if (
            payload &&
            typeof payload === "object" &&
            "data" in (payload as Record<string, unknown>) &&
            Array.isArray((payload as Record<string, unknown>).data)
          ) {
            setSpots((payload as Record<string, unknown>).data as Spot[]);
          } else if (payload && typeof payload === "object" && "error" in (payload as Record<string, unknown>)) {
            console.error("/api/spots returned error:", (payload as Record<string, unknown>).error ?? payload);
            setSpots([]);
          } else {
            console.warn("/api/spots returned unexpected payload, falling back to empty list:", payload);
            setSpots([]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      fetchSpots();
  }, [userId]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中...</p>;

  if (spots.length === 0) return <p className="text-sm text-gray-500">データがありません。</p>;

  return (
    <div className="bg-white rounded-md border border-gray-100">
      <ul className="divide-y divide-gray-100">
        {spots.map((spot, idx) => (
          <li key={spot.id} className="flex gap-3 items-start p-3 hover:bg-gray-50">
            {spot.image_url ? (
              <div className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={spot.image_url}
                  alt={spot.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 flex-shrink-0 rounded-md bg-gray-50 border border-dashed border-gray-100 flex items-center justify-center text-xs text-gray-400">
                no image
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{spot.title}</h3>
              {(() => {
                const desc = spot.description ?? spot.body ?? null;
                return desc ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{desc}</p> : null;
              })()}

              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <div>
                  {(() => {
                    const latVal = typeof spot.latitude === "number" ? spot.latitude : spot.lat;
                    const lngVal = typeof spot.longitude === "number" ? spot.longitude : spot.lng;
                    if (typeof latVal === "number" && typeof lngVal === "number") {
                      return `lat: ${latVal.toFixed(5)}, lng: ${lngVal.toFixed(5)}`;
                    }
                    return "位置情報なし";
                  })()}
                </div>
                <div className="text-gray-300">#{idx + 1}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
