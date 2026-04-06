import { NextRequest, NextResponse } from "next/server";

const ALL_SETS = [
  "OP01","OP02","OP03","OP04","OP05","OP06","OP07","OP08","OP09","OP10",
  "ST01","ST02","ST03","ST04","ST05","ST06","ST07","ST08","ST09","ST10",
  "ST11","ST12","ST13","ST14","ST15","ST16","ST17","ST18","ST19","ST20",
  "EB01","EB02","P",
];

const SET_NAMES: Record<string, string> = {
  "OP01":"Romance Dawn","OP02":"Paramount War","OP03":"Pillars of Strength",
  "OP04":"Kingdoms of Intrigue","OP05":"Awakening of the New Era",
  "OP06":"Wings of the Captain","OP07":"500 Years in the Future",
  "OP08":"Two Legends","OP09":"The Four Emperors","OP10":"Royal Blood",
  "ST01":"Straw Hat Crew","ST02":"Worst Generation","ST03":"The Seven Warlords",
  "ST04":"Animal Kingdom Pirates","ST05":"ONE PIECE Film Edition",
  "ST06":"Absolute Justice","ST07":"Big Mom Pirates","ST08":"Monkey D. Luffy",
  "ST09":"Yamato","ST10":"Marineford","ST11":"Uta","ST12":"Zoro & Sanji",
  "ST13":"The Three Captains","ST14":"3D2Y","ST15":"Red-Haired Shanks",
  "ST16":"Aces Gone Wild","ST17":"Knight of the Sea","ST18":"Side Characters",
  "ST19":"Worst Generation Returns","ST20":"Uta Returns",
  "EB01":"Memorial Collection","EB02":"Clan Gathering",
};

async function fetchSet(setCode: string, search: string) {
  try {
    const setName = SET_NAMES[setCode] || setCode;
    const params = new URLSearchParams({ per_page: "100", set: setName });
    if (search) params.set("search", search);
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
      // Single set browse
      cards = await fetchSet(set, "");
    } else if (search) {
      // Search across all sets in parallel — limit to main sets for speed
      const setsToSearch = ["OP01","OP02","OP03","OP04","OP05","OP06","OP07","OP08","OP09","OP10","ST01","ST02","ST03","ST04","ST05","EB01","EB02"];
      const results = await Promise.all(setsToSearch.map(s => fetchSet(s, search)));
      cards = results.flat();
      // Deduplicate by card ID
      const seen = new Set();
      cards = cards.filter(c => {
        const key = c.id || c.code || c.name;
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
