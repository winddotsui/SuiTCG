import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS: Record<string, number> = {
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN": 1,
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN": 1,
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC": 1,
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC": 1,
};

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!Array.isArray(coinTypes)) return NextResponse.json({ prices: {} });

    const prices: Record<string, number> = {};

    // Stablecoins = $1
    for (const ct of coinTypes) {
      if (STABLE_COINS[ct]) prices[ct] = STABLE_COINS[ct];
    }

    // Fetch ALL token prices from GeckoTerminal in parallel
    // GeckoTerminal covers every token on Sui with a DEX pool
    const nonStable = coinTypes.filter(ct => !prices[ct]);

    await Promise.all(nonStable.map(async (ct) => {
      try {
        const addr = ct.split("::")[0];
        const res = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/sui-network/tokens/${addr}`,
          {
            headers: { "Accept": "application/json" },
            next: { revalidate: 30 }
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const p = parseFloat(data?.data?.attributes?.price_usd || "0");
        if (p > 0) prices[ct] = p;
      } catch {}
    }));

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
