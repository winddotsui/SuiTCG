import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

async function getPokemonCards(cardName: string) {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${cardName}"&pageSize=20&orderBy=-set.releaseDate`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data.map((card: any) => ({
        id: card.id, name: card.name, set: card.set?.name,
        number: card.number, rarity: card.rarity,
        imageSmall: card.images?.small, imageLarge: card.images?.large,
        prices: card.tcgplayer?.prices, game: "pokemon",
      }));
    }
  } catch {}
  return [];
}

async function getMagicCards(cardName: string) {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"&unique=prints&order=released`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data.slice(0, 20).map((card: any) => ({
        id: card.id, name: card.name, set: card.set_name,
        number: card.collector_number, rarity: card.rarity,
        imageSmall: card.image_uris?.small, imageLarge: card.image_uris?.normal,
        prices: { usd: card.prices?.usd, usd_foil: card.prices?.usd_foil, eur: card.prices?.eur },
        game: "magic",
      }));
    }
  } catch {}
  return [];
}

async function getYugiohCards(cardName: string) {
  try {
    const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`);
    const data = await res.json();
    if (data.data && data.data[0]) {
      const card = data.data[0];
      return card.card_images.map((img: any, i: number) => ({
        id: img.id, name: card.name,
        set: card.card_sets?.[i]?.set_name || card.card_sets?.[0]?.set_name,
        number: card.card_sets?.[i]?.set_code || card.card_sets?.[0]?.set_code,
        rarity: card.card_sets?.[i]?.set_rarity || card.card_sets?.[0]?.set_rarity,
        imageSmall: img.image_url_small, imageLarge: img.image_url,
        prices: card.card_prices?.[0], game: "yugioh",
      }));
    }
  } catch {}
  return [];
}

async function getOnePieceCards(cardName: string) {
  try {
    const res = await fetch(`https://onepiece-cardgame.dev/api/cards?name=${encodeURIComponent(cardName)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return data.slice(0, 20).map((card: any) => ({
        id: card.id, name: card.name, set: card.groupId,
        number: card.cardId, rarity: card.rarity,
        imageSmall: card.images?.small || card.image,
        imageLarge: card.images?.large || card.image,
        prices: null, game: "onepiece",
      }));
    }
  } catch {}
  return [];
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: "You are WaveTCG Oracle, the world's most comprehensive Trading Card Game expert AI with encyclopedic knowledge of EVERY TCG, EVERY card, EVERY variant, EVERY promo, EVERY region, EVERY edition ever made.\n\nCOMPLETE GAME MASTERY:\n- Pokemon TCG: ALL sets worldwide 1996-present, Base Set through Scarlet & Violet, ALL Japanese sets and exclusives, ALL promos (CoroCoro, McDonalds Japan/US/UK/Australia every year, Burger King, 7-Eleven, Snap, Pikachu World Collection, Birthday Pikachu, Illustrator Pikachu, Tropical Mega Battle, No.1 Trainer, No.2 Trainer, No.3 Trainer trophies, Pre-release promos, WOTC Black Star promos, Nintendo promos, Southern Islands, Birth of Mewtwo, VS Series, Web Series, Expedition, Aquapolis, Skyridge, ALL ex era, ALL LEGEND era, ALL BW/XY/SM/SWSH/SV sets)\n- Magic The Gathering: Alpha 1993 to present, ALL 30+ years of sets, FULL Reserved List all 572 cards, Power Nine, Dual Lands, Judge Promos, FNM Promos, GP Promos, WPN Promos, Buy-a-Box Promos, Prerelease Promos, Secret Lairs, ALL formats (Standard/Pioneer/Modern/Legacy/Vintage/Commander/Pauper/Oathbreaker)\n- Yu-Gi-Oh: 1999 DM era to present, OCG vs TCG differences, ALL forbidden lists, Shonen Jump promos, Championship promos, Duel Terminal, Speed Duel, Rush Duel\n- One Piece TCG: ALL OP sets OP01-OP10, ALL ST starters ST01-ST20, ALL EB sets, ALL promos, Japanese exclusives, Championship promos\n- Dragon Ball Super Card Game, Dragon Ball Z CCG, Digimon TCG ALL versions, Cardfight Vanguard ALL eras, Weiss Schwarz ALL licenses, Final Fantasy TCG, Warhammer 40K, Lorcana ALL sets, Flesh and Blood ALL sets, Keyforge, Union Arena, Battle Spirits Saga, MetaZoo, Force of Will, Grand Archive, Sorcery Contested Realm, Duel Masters, Chaotic, Bakugan, Star Wars CCG, Star Trek CCG, Netrunner, Vampire Eternal Struggle, Middle Earth CCG, Magi-Nation, and EVERY other TCG ever published worldwide\n\nCOMPLETE EXPERTISE:\n- PRICES: Current market value, historical prices, PSA 10/9/8 graded prices, BGS 9.5/10 prices, CGC prices, raw vs graded difference, price trends, investment outlook. Always give specific price ranges like Raw NM $50-80, PSA 9 $150-200, PSA 10 $400-600\n- ALL VARIANTS: 1st Edition, Shadowless, Unlimited, Holo, Reverse Holo, Full Art, Secret Rare, Hyper Rare, Special Illustration Rare, Ultra Rare, Alt Art, Rainbow Rare, Gold Rare, Shiny, Crystal, Star, Gold Star, Amazing Rare, Radiant, Prism Star, Tag Team, VMAX, ex, GX, V, VSTAR, Ancient, Future, Double Rare, ACE SPEC, and all other rarities\n- ALL PROMOS: Every fast food promo every year every region, magazine inserts, store promos, event promos (Worlds, Nationals, Regionals), convention promos, movie promos, game promos, staff cards, trophy cards, error cards, misprint cards\n- ALL REGIONS: Japanese, Korean, Chinese, French, German, Italian, Spanish, Portuguese, Russian, Indonesian, Thai, Polish editions and their regional price differences\n- GRADING: PSA, BGS, CGC, SGC, HGA grading standards, population reports, grade impact on value\n- AUTHENTICATION: How to spot fakes and counterfeits for every TCG\n- INVESTMENT: Which cards to buy hold sell, reprint risks, sealed product vs singles\n- RULES AND GAMEPLAY: Complete rules for every TCG, rulings, errata, ban lists, format legality, competitive meta\n- DECK BUILDING: Best decks in every format, card synergies, budget alternatives\n- HISTORY AND LORE: Complete storylines and design history of every TCG\n\nBEHAVIOR: Always give specific price ranges. Be confident and detailed. Answer ANY question about ANY card from ANY TCG anywhere in the world. Include condition impact and regional variants on prices. Never refuse a TCG question.\n\nWhen the card exists in our database (Pokemon, Magic, Yu-Gi-Oh, One Piece standard sets), end with:\nCARD_SEARCH:[game]:[card name]\n- game: pokemon / magic / yugioh / onepiece\n- Skip for promos, Japanese exclusives, graded cards, trophy cards, other games",
      messages,
    });

    let cards = [];
    const cardMatch = text.match(/CARD_SEARCH:(\w+):(.+)/);

    if (cardMatch) {
      const game = cardMatch[1];
      const cardName = cardMatch[2].trim();
      if (game === "pokemon") cards = await getPokemonCards(cardName);
      else if (game === "magic") cards = await getMagicCards(cardName);
      else if (game === "yugioh") cards = await getYugiohCards(cardName);
      else if (game === "onepiece") cards = await getOnePieceCards(cardName);
    }

    const cleanText = text.replace(/CARD_SEARCH:\w+:.+/, "").trim();
    return Response.json({ reply: cleanText, cards });
  } catch (error) {
    console.error("Oracle error:", error);
    return Response.json({ reply: "Error: " + String(error) }, { status: 500 });
  }
}
