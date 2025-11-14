"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Spot = {
  id: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  image_url: string | null;
  created_at: string;
};

export default function SpotsList() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchSpots = async () => {
        try {
          const res = await fetch("/api/spots");
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
    }, []);

  if (loading) return <p>読み込み中...</p>;

  if (spots.length === 0) return <p>データがありません。</p>;

  return (
    <ul className="space-y-3">
      {spots.map((spot) => (
        <li
          key={spot.id}
          className="border rounded-lg p-3 flex gap-3 items-start"
        >
          {spot.image_url && (
            <div className="w-20 h-20 relative rounded overflow-hidden">
              <Image
                src={spot.image_url}
                alt={spot.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="font-semibold">{spot.title}</h2>
            {spot.description && (
              <p className="text-sm text-gray-700">{spot.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              lat: {spot.lat}, lng: {spot.lng}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
