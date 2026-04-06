import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS = new Set([
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
]);

// Known CoinGecko IDs for major Sui tokens
const COINGECKO_IDS: Record<string, string> = {
  "0x2::sui::SUI": "sui",
  "0x9b5a3db572955df65f071e09f29b8b8f0db952c5ae0ffc2d4f8a24d5882c81d1::wal::WAL": "walrus-2",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946ea44::deep::DEEP": "deep-book",
  "0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS": "cetus-protocol",
  "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044ef5cb90::navx::NAVX": "navi-protocol",
  "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI": "haedal-staked-sui",
  "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI": "aftermath-staked-sui",
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT": "volo-staked-sui",
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3ef087e3e09b1::suins_token::SUINS_TOKEN": "suins",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN": "wrapped-bitcoin",
};

async function getDexScreenerPrices(coinTypes: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  // Batch all tokens into one request using comma-separated addresses
  const addresses = coinTypes
    .filter(t => !STABLE_COINS.has(t) && t !== "0x2::sui::SUI")
    .map(t => t.split("::")[0]);

  if (addresses.length === 0) return prices;

  try {
    // DEX Screener supports multiple tokens in one call
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/sui/${addresses.join(",")}`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 30 }
      }
    );
    if (!res.ok) return prices;
    const data = await res.json();
    const pairs = Array.isArray(data) ? data : (data?.pairs || []);

    // Group pairs by base token address
    const pairsByAddr: Record<string, any[]> = {};
    for (const pair of pairs) {
      const addr = pair.baseToken?.address?.toLowerCase();
      if (!addr) continue;
      if (!pairsByAddr[addr]) pairsByAddr[addr] = [];
      pairsByAddr[addr].push(pair);
    }

    // For each coinType, find best price
    for (const coinType of coinTypes) {
      const addr = coinType.split("::")[0].toLowerCase();
      const tokenPairs = pairsByAddr[addr];
      if (!tokenPairs || tokenPairs.length === 0) continue;

      // Sort by liquidity, pick highest
      tokenPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      const price = parseFloat(tokenPairs[0]?.priceUsd || "0");
      if (price > 0) prices[coinType] = price;
    }
  } catch (e) {
    console.error("DEX Screener error:", e);
  }

  return prices;
}

async function getCoinGeckoPrices(coinTypes: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const ids = coinTypes
    .map(t => COINGECKO_IDS[t])
    .filter(Boolean);

  if (ids.length === 0) return prices;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${[...new Set(ids)].join(",")}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return prices;
    const data = await res.json();

    for (const coinType of coinTypes) {
      const id = COINGECKO_IDS[coinType];
      if (id && data[id]?.usd) prices[coinType] = data[id].usd;
    }
  } catch {}

  return prices;
}

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!coinTypes || !Array.isArray(coinTypes)) {
      return NextResponse.json({ prices: {} });
    }

    const prices: Record<string, number> = {};

    // Stablecoins = $1
    for (const coinType of coinTypes) {
      if (STABLE_COINS.has(coinType)) prices[coinType] = 1.0;
    }

    // Fetch CoinGecko + DEX Screener in parallel
    const [cgPrices, dexPrices] = await Promise.all([
      getCoinGeckoPrices(coinTypes),
      getDexScreenerPrices(coinTypes),
    ]);

    // Merge: CoinGecko first, DEX Screener fills gaps
    for (const coinType of coinTypes) {
      if (prices[coinType]) continue; // already stablecoin
      prices[coinType] = cgPrices[coinType] || dexPrices[coinType] || 0;
    }

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
