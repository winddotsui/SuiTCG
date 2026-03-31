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
      system: `You are SuiTCG Oracle, an expert AI assistant for ALL Trading Card Games including Pokemon TCG, Magic: The Gathering, Yu-Gi-Oh!, One Piece Card Game, Dragon Ball Super, Lorcana, Flesh and Blood, Digimon, and more.

When the user asks about a specific card, end your response with EXACTLY this format on its own line:
CARD_SEARCH:[game]:[exact card name]

Rules:
- game must be: pokemon, magic, yugioh, or onepiece
- Use the most accurate card name
- Only include CARD_SEARCH if asking about a specific card
- Do NOT include price info in your text, prices will be shown from live data`,
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
