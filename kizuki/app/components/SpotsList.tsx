"use client";

import { useEffect, useState } from "react";

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
        setSpots(data);
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
            <img
              src={spot.image_url}
              alt={spot.title}
              className="w-20 h-20 object-cover rounded"
            />
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
