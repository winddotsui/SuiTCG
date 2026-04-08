import { NextRequest, NextResponse } from "next/server";

const BASE = "https://optcgapi.com/api";

async function searchCards(query: string): Promise<any[]> {
  const results: any[] = [];
  
  // Search set cards, starter deck cards, and promos in parallel
  await Promise.all([
    fetch(`${BASE}/sets/filtered/?card_name=${encodeURIComponent(query)}&limit=100`, { next: { revalidate: 1800 } })
      .then(r => r.ok ? r.json() : [])
      .then(data => results.push(...(Array.isArray(data) ? data : data.results || []).map((c: any) => ({ ...c, _source: "set" }))))
      .catch(() => {}),

    fetch(`${BASE}/decks/filtered/?card_name=${encodeURIComponent(query)}&limit=100`, { next: { revalidate: 1800 } })
      .then(r => r.ok ? r.json() : [])
      .then(data => results.push(...(Array.isArray(data) ? data : data.results || []).map((c: any) => ({ ...c, _source: "deck" }))))
      .catch(() => {}),

    fetch(`${BASE}/promos/filtered/?card_name=${encodeURIComponent(query)}&limit=100`, { next: { revalidate: 1800 } })
      .then(r => r.ok ? r.json() : [])
      .then(data => results.push(...(Array.isArray(data) ? data : data.results || []).map((c: any) => ({ ...c, _source: "promo" }))))
      .catch(() => {}),
  ]);

  return results;
}

function normalizeCard(c: any): any {
  const code = c.card_set_id || c.card_id || c.card_number || c.id || "";
  const name = c.card_name || c.name || "";
  const set = c.set_name || c.deck_name || c.set_id || c.deck_id || "";
  return {
    id: c.card_image_id || code,
    name,
    code,
    set,
    rarity: c.rarity || "",
    color: c.card_color || c.color || "",
    type: c.card_type || c.type || "",
    image: c.card_image || `https://en.onepiece-cardgame.com/images/cardlist/card/${code}.png`,
    price: c.market_price || c.inventory_price || null,
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
      const endpoint = set.startsWith("ST") ? `${BASE}/decks/${set}/` : `${BASE}/sets/${set}/`;
      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        cards = (data.cards || data.results || Array.isArray(data) ? (Array.isArray(data) ? data : data.cards || data.results || []) : []).map(normalizeCard);
      }
    } else if (search) {
      const raw = await searchCards(search);

      // Sort by relevance
      const q = search.toLowerCase();
      raw.sort((a, b) => {
        const an = (a.card_name || a.name || "").toLowerCase();
        const bn = (b.card_name || b.name || "").toLowerCase();
        const aScore = an === q ? 0 : an.startsWith(q) ? 1 : an.includes(q) ? 2 : 3;
        const bScore = bn === q ? 0 : bn.startsWith(q) ? 1 : bn.includes(q) ? 2 : 3;
        return aScore - bScore;
      });

      // Deduplicate by card_image_id (unique per variant)
      const seen = new Set();
      cards = raw.filter(c => {
        const key = c.card_image_id || c.card_set_id || c.card_name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map(normalizeCard);
    } else {
      const res = await fetch(`${BASE}/sets/OP01/`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        cards = (data.cards || []).map(normalizeCard);
      }
    }

    return NextResponse.json({ cards });
  } catch (e: any) {
    return NextResponse.json({ cards: [], error: e.message });
  }
}
