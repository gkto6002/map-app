import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

export async function GET() {
  console.log("[GET /api/spots] start");
  try {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // supabase-js may return HTML error pages in error.message when the host is unreachable
      const raw = String(error.message ?? "");
      console.error("[GET /api/spots] supabase error:", raw);
      const isHtml = raw.trim().startsWith("<") || raw.includes("<!DOCTYPE");
      const detail = isHtml ? "Supabase returned an HTML error page (possible 5xx/timeout)." : raw;
      return NextResponse.json({ error: "supabase_error", detail, raw: isHtml ? raw.slice(0, 800) : undefined }, { status: 502 });
    }

    console.log("[GET /api/spots] data:", data);
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    // network / unexpected errors
    const raw = String(err instanceof Error ? err.message : err);
    console.error("[GET /api/spots] unexpected error:", raw);
    const isHtml = raw.trim().startsWith("<") || raw.includes("<!DOCTYPE");
    const detail = isHtml ? "Supabase returned an HTML error page (possible 5xx/timeout)." : raw;
    return NextResponse.json({ error: "unexpected_error", detail, raw: isHtml ? raw.slice(0, 800) : undefined }, { status: 502 });
  }
}
