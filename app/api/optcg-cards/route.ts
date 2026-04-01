import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const set = searchParams.get("set") || "OP01";
  const search = searchParams.get("search") || "";

  const SET_NAMES: Record<string, string> = {
    "OP01": "Romance Dawn", "OP02": "Paramount War", "OP03": "Pillars of Strength",
    "OP04": "Kingdoms of Intrigue", "OP05": "Awakening of the New Era",
    "OP06": "Wings of the Captain", "OP07": "500 Years in the Future",
    "OP08": "Two Legends", "OP09": "The Four Emperors", "OP10": "Royal Blood",
  };

  const setName = SET_NAMES[set] || set;

  try {
    const params = new URLSearchParams({
      per_page: "100",
      set: setName,
    });
    if (search) params.set("search", search);

    const res = await fetch(
      `https://optcg-api.ryanmichaelhirst.us/api/v1/cards?${params}`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    const cards = data.data || [];

    return NextResponse.json({ cards });
  } catch (e: any) {
    console.error("OPTCG API error:", e);
    return NextResponse.json({ cards: [], error: e.message });
  }
}cat app/page.tsx | head -5