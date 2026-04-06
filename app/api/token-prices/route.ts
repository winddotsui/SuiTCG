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

    // Stablecoins
    for (const ct of coinTypes) {
      if (STABLE_COINS[ct]) prices[ct] = STABLE_COINS[ct];
    }

    const nonStable = coinTypes.filter(ct => !prices[ct]);
    if (nonStable.length === 0) return NextResponse.json({ prices });

    // Get contract addresses (first part before ::)
    const addrMap: Record<string, string> = {};
    for (const ct of nonStable) {
      const addr = ct.split("::")[0].toLowerCase();
      addrMap[addr] = ct;
    }

    const addresses = Object.keys(addrMap).join(",");

    // CoinGecko token price by contract address on Sui network
    const url = `https://api.coingecko.com/api/v3/simple/token_price/sui-network?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      for (const [addr, price] of Object.entries(data)) {
        const coinType = addrMap[addr.toLowerCase()];
        if (coinType && (price as any).usd) {
          prices[coinType] = (price as any).usd;
        }
      }
    }

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
