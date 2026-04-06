import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS = new Set([
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
]);

// GeckoTerminal API - free, no key needed, has all Sui DEX tokens
async function getGeckoTerminalPrices(coinTypes: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const nonStable = coinTypes.filter(ct => !STABLE_COINS.has(ct) && ct !== "0x2::sui::SUI");
  
  await Promise.all(nonStable.map(async (coinType) => {
    try {
      const addr = coinType.split("::")[0];
      const res = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/sui-network/tokens/${addr}`,
        { 
          headers: { "Accept": "application/json" },
          next: { revalidate: 30 }
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const price = parseFloat(data?.data?.attributes?.price_usd || "0");
      if (price > 0) prices[coinType] = price;
    } catch {}
  }));
  
  return prices;
}

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

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!coinTypes || !Array.isArray(coinTypes)) {
      return NextResponse.json({ prices: {} });
    }

    const prices: Record<string, number> = {};

    // Stablecoins = $1
    for (const ct of coinTypes) {
      if (STABLE_COINS.has(ct)) prices[ct] = 1.0;
    }

    // SUI price from CoinGecko
    const suiPrice = await getSuiPrice();
    if (suiPrice > 0) prices["0x2::sui::SUI"] = suiPrice;

    // All other tokens from GeckoTerminal (has WAL, DEEP, NS, all Sui DEX tokens)
    const gtPrices = await getGeckoTerminalPrices(coinTypes);
    for (const [ct, price] of Object.entries(gtPrices)) {
      prices[ct] = price;
    }

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
