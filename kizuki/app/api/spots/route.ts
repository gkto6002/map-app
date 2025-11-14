import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

export async function GET() {
  console.log("[GET /api/spots] start");

  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/spots] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[GET /api/spots] data:", data);

  return NextResponse.json(data, { status: 200 });
}
