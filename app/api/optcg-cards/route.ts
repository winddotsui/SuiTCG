import { NextRequest, NextResponse } from "next/server";

const ALL_SETS = [
  "OP01","OP02","OP03","OP04","OP05","OP06","OP07","OP08","OP09","OP10",
  "ST01","ST02","ST03","ST04","ST05","ST06","ST07","ST08","ST09","ST10",
  "ST11","ST12","ST13","ST14","ST15","ST16","ST17","ST18","ST19","ST20",
  "EB01","EB02",
];

async function searchOPTCG(query: string): Promise<any[]> {
  try {
    // Use the official One Piece TCG card list API
    const res = await fetch(
      `https://en.onepiece-cardgame.com/cardlist/?series=&keyword=${encodeURIComponent(query)}&category=&attribute=&power=&counter=&color=&type=&rarity=&cost=&life=&trigger=`,
      {
        headers: {
          "Accept": "application/json, text/javascript, */*",
          "X-Requested-With": "XMLHttpRequest",
        },
        next: { revalidate: 3600 }
      }
    );
    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
      } catch {}
    }
  } catch {}
  return [];
}

async function fetchFromAPI(search: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({ per_page: "30" });
    if (search) params.set("search", search);
    const res = await fetch(
      `https://optcg-api.ryanmichaelhirst.us/api/v1/cards?${params}`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

async function fetchSet(setCode: string, search: string) {
  try {
    const params = new URLSearchParams({ per_page: "100", set: setCode });
    if (search) params.set("q", search);
    const res = await fetch(
      `https://optcg-api.ryanmichaelhirst.us/api/v1/cards?${params}`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((c: any) => ({ ...c, setCode }));
  } catch { return []; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const set = searchParams.get("set") || "";
  const search = searchParams.get("search") || "";

  try {
    let cards: any[] = [];

    if (!search && set) {
      cards = await fetchSet(set, "");
    } else if (search) {
      // Search all sets in parallel for accuracy
      const results = await Promise.all(ALL_SETS.map(s => fetchSet(s, search)));
      cards = results.flat();

      // Sort by relevance - exact matches first
      const q = search.toLowerCase();
      cards.sort((a, b) => {
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        const aExact = an === q ? 0 : an.startsWith(q) ? 1 : an.includes(q) ? 2 : 3;
        const bExact = bn === q ? 0 : bn.startsWith(q) ? 1 : bn.includes(q) ? 2 : 3;
        return aExact - bExact;
      });

      // Deduplicate by card code
      const seen = new Set();
      cards = cards.filter(c => {
        const key = c.code || c.id || (c.name + c.setCode);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      cards = await fetchSet("OP01", "");
    }

    return NextResponse.json({ cards });
  } catch (e: any) {
    return NextResponse.json({ cards: [], error: e.message });
  }
}
