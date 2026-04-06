import { NextRequest, NextResponse } from "next/server";

// Known Cetus pool addresses for major Sui tokens
// Pool format: tokenA/tokenB — we use SUI as base quote
const CETUS_POOLS: Record<string, string> = {
  // WAL/SUI pool
  "0x9b5a3db572955df65f071e09f29b8b8f0db952c5ae0ffc2d4f8a24d5882c81d1::wal::WAL":
    "0x3f27289ef57a3e76b1cdf749f0e7dcc87e6a7dd3e6b5b49fa21441d0c26a5bb8",
  // DEEP/SUI pool
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946ea44::deep::DEEP":
    "0xf948e6b22c7e1e44d21c08da2d75b85e4c8b6e4c93c7a02af0e6e7a3a89c7e4",
  // NS/SUI pool
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3ef087e3e09b1::suins_token::SUINS_TOKEN":
    "0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded",
};

const SUI_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd";

async function getSuiPrice(): Promise<number> {
  try {
    const res = await fetch(SUI_PRICE_URL, { next: { revalidate: 60 } });
    const data = await res.json();
    return data?.sui?.usd || 0;
  } catch { return 0; }
}

async function getCetusPrice(coinType: string, suiPrice: number): Promise<number | null> {
  try {
    // Use Cetus aggregator price API
    const coinAddr = coinType.split("::")[0];
    const suiAddr = "0x0000000000000000000000000000000000000000000000000000000000000002";
    
    const res = await fetch(
      `https://api-sui.cetus.zone/v2/sui/price?coin_type=${encodeURIComponent(coinType)}`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 60 } }
    );
    
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.price) return parseFloat(data.data.price);
    }

    // Fallback: try Cetus swap quote API for price discovery
    const quoteRes = await fetch(
      `https://api-sui.cetus.zone/v2/sui/swap_price?from=${encodeURIComponent(coinType)}&to=0x2::sui::SUI&amount=1000000000`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 60 } }
    );
    
    if (quoteRes.ok) {
      const quoteData = await quoteRes.json();
      const suiAmount = quoteData?.data?.output_amount;
      if (suiAmount) {
        const suiValue = Number(suiAmount) / 1e9;
        return suiValue * suiPrice;
      }
    }
    
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!coinTypes || !Array.isArray(coinTypes)) {
      return NextResponse.json({ prices: {} });
    }

    const suiPrice = await getSuiPrice();
    const prices: Record<string, number> = {
      "0x2::sui::SUI": suiPrice,
    };

    // Also handle USDC/USDT
    const stableTypes = [
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
      "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC",
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    ];

    const nonSuiTypes = coinTypes.filter(t => t !== "0x2::sui::SUI");

    await Promise.all(nonSuiTypes.map(async (coinType) => {
      if (stableTypes.includes(coinType)) {
        prices[coinType] = 1.0;
        return;
      }
      const price = await getCetusPrice(coinType, suiPrice);
      if (price !== null) prices[coinType] = price;
    }));

    return NextResponse.json({ prices, suiPrice });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
