import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS = new Set([
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
]);

async function getSuiPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return data?.sui?.usd || 0;
  } catch { return 0; }
}

async function getDexScreenerPrice(coinType: string): Promise<number | null> {
  try {
    // Use contract address (first part before ::)
    const addr = coinType.split("::")[0];
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addr}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = data?.pairs;
    if (!pairs || pairs.length === 0) return null;
    // Get the most liquid Sui pair
    const suiPairs = pairs.filter((p: any) => p.chainId === "sui");
    if (suiPairs.length === 0) return null;
    // Sort by liquidity and get best pair
    suiPairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const price = parseFloat(suiPairs[0]?.priceUsd || "0");
    return price > 0 ? price : null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!coinTypes || !Array.isArray(coinTypes)) {
      return NextResponse.json({ prices: {} });
    }

    const suiPrice = await getSuiPrice();
    const prices: Record<string, number> = {};

    await Promise.all(coinTypes.map(async (coinType: string) => {
      if (coinType === "0x2::sui::SUI") {
        prices[coinType] = suiPrice;
        return;
      }
      if (STABLE_COINS.has(coinType)) {
        prices[coinType] = 1.0;
        return;
      }
      // Try DEX Screener for all other tokens
      const price = await getDexScreenerPrice(coinType);
      if (price !== null) prices[coinType] = price;
    }));

    return NextResponse.json({ prices, suiPrice });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
