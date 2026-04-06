import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS = new Set([
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
]);

const COINGECKO_IDS: Record<string, string> = {
  "0x2::sui::SUI": "sui",
  "0x9b5a3db572955df65f071e09f29b8b8f0db952c5ae0ffc2d4f8a24d5882c81d1::wal::WAL": "walrus-2",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946ea44::deep::DEEP": "deep-book",
  "0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS": "cetus-protocol",
  "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044ef5cb90::navx::NAVX": "navi-protocol",
  "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI": "haedal-staked-sui",
  "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI": "aftermath-staked-sui",
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT": "volo-staked-sui",
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS": "suins-token",
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3ef087e3e09b1::suins_token::SUINS_TOKEN": "suins-token",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN": "wrapped-bitcoin",
};

async function getCoinGeckoPrices(coinTypes: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const idMap: Record<string, string> = {};
  const ids: string[] = [];

  for (const ct of coinTypes) {
    const id = COINGECKO_IDS[ct];
    if (id && !ids.includes(id)) {
      ids.push(id);
      idMap[id] = ct;
    }
  }
  if (ids.length === 0) return prices;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`,
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

async function getDexScreenerPrice(addr: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addr}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = data?.pairs || [];
    const suiPairs = pairs.filter((p: any) => p.chainId === "sui" && parseFloat(p.priceUsd || "0") > 0);
    if (suiPairs.length === 0) return null;
    suiPairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    return parseFloat(suiPairs[0].priceUsd);
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!coinTypes || !Array.isArray(coinTypes)) {
      return NextResponse.json({ prices: {} });
    }

    const prices: Record<string, number> = {};

    // Stablecoins
    for (const ct of coinTypes) {
      if (STABLE_COINS.has(ct)) prices[ct] = 1.0;
    }

    // CoinGecko for known tokens
    const cgPrices = await getCoinGeckoPrices(coinTypes);
    for (const [ct, price] of Object.entries(cgPrices)) {
      prices[ct] = price;
    }

    // DEX Screener for unknown tokens
    const unknown = coinTypes.filter(ct => !prices[ct] && !STABLE_COINS.has(ct));
    await Promise.all(unknown.map(async (ct) => {
      const addr = ct.split("::")[0];
      const price = await getDexScreenerPrice(addr);
      if (price !== null && price > 0) prices[ct] = price;
    }));

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
