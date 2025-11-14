import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseClient";

export async function POST() {
  const dummy = [
    {
      title: "公園のベンチ",
      description: "日当たりが良い場所",
      lat: 35.6812,
      lng: 139.7671,
      image_url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e",
    },
    {
      title: "静かなカフェ",
      description: "勉強しやすい店",
      lat: 35.6809,
      lng: 139.7680,
      image_url: "https://images.unsplash.com/photo-1503602642458-232111445657",
    },
  ];

  const { data, error } = await supabaseAdmin
    .from("spots")
    .insert(dummy)
    .select("*");

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data }, { status: 200 });
}
