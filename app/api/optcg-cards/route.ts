import { NextRequest, NextResponse } from "next/server";

const BASE = "https://optcgapi.com/api";

async function searchAllCards(query: string): Promise<any[]> {
  const results: any[] = [];
  
  // Search set cards
  try {
    const res = await fetch(
      `${BASE}/sets/filtered/?name=${encodeURIComponent(query)}&limit=100`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const cards = data.results || data || [];
      results.push(...cards.map((c: any) => ({ ...c, _source: "set" })));
    }
  } catch {}

  // Search starter deck cards
  try {
    const res = await fetch(
      `${BASE}/decks/filtered/?name=${encodeURIComponent(query)}&limit=100`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const cards = data.results || data || [];
      results.push(...cards.map((c: any) => ({ ...c, _source: "deck" })));
    }
  } catch {}

  // Search promo cards
  try {
    const res = await fetch(
      `${BASE}/promos/filtered/?name=${encodeURIComponent(query)}&limit=100`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const cards = data.results || data || [];
      results.push(...cards.map((c: any) => ({ ...c, _source: "promo" })));
    }
  } catch {}

  return results;
}

function normalizeCard(c: any): any {
  const code = c.card_id || c.card_number || c.id || "";
  const set = c.set_id || c.deck_id || c.promo_id || c.set_name || c.deck_name || "";
  return {
    id: code,
    name: c.name || c.card_name || "",
    code,
    set,
    rarity: c.rarity || "",
    color: c.color || "",
    type: c.card_type || c.type || "",
    image: c.card_image || c.image_url || `https://en.onepiece-cardgame.com/images/cardlist/card/${code}.png`,
    price: c.market_price || null,
    source: c._source || "set",
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const set = searchParams.get("set") || "";
  const search = searchParams.get("search") || "";

  try {
    let cards: any[] = [];

    if (!search && set) {
      // Browse specific set
      const endpoint = set.startsWith("ST") ? `${BASE}/decks/${set}/` : `${BASE}/sets/${set}/`;
      try {
        const res = await fetch(endpoint, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          cards = (data.cards || data.results || []).map(normalizeCard);
        }
      } catch {}
    } else if (search) {
      const raw = await searchAllCards(search);
      
      // Sort by relevance
      const q = search.toLowerCase();
      raw.sort((a, b) => {
        const an = (a.name || a.card_name || "").toLowerCase();
        const bn = (b.name || b.card_name || "").toLowerCase();
        const aScore = an === q ? 0 : an.startsWith(q) ? 1 : an.includes(q) ? 2 : 3;
        const bScore = bn === q ? 0 : bn.startsWith(q) ? 1 : bn.includes(q) ? 2 : 3;
        return aScore - bScore;
      });

      // Deduplicate by card code
      const seen = new Set();
      cards = raw
        .filter(c => {
          const key = c.card_id || c.card_number || c.id || (c.name + c.set_id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map(normalizeCard);
    } else {
      // Default: OP01
      try {
        const res = await fetch(`${BASE}/sets/OP01/`, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          cards = (data.cards || data.results || []).map(normalizeCard);
        }
      } catch {}
    }

    return NextResponse.json({ cards });
  } catch (e: any) {
    return NextResponse.json({ cards: [], error: e.message });
  }
}
