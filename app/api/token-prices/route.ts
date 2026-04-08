import { NextRequest, NextResponse } from "next/server";

const STABLE_COINS: Record<string, number> = {
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN": 1,
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN": 1,
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC": 1,
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC": 1,
};

// All known Sui tokens mapped to CoinGecko IDs
const CG_IDS: Record<string, string> = {
  "0x2::sui::SUI": "sui",
  "0x9b5a3db572955df65f071e09f29b8b8f0db952c5ae0ffc2d4f8a24d5882c81d1::wal::WAL": "walrus-2",
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL": "walrus-2",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946ea44::deep::DEEP": "deep",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP": "deep",
  "0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS": "cetus-protocol",
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS": "suins-token",
  "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3ef087e3e09b1::suins_token::SUINS_TOKEN": "suins-token",
  "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044ef5cb90::navx::NAVX": "navi-protocol",
  "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI": "haedal-staked-sui",
  "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI": "aftermath-staked-sui",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN": "wrapped-bitcoin",
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT": "volo-staked-sui",
  "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e48f9571920::eth::ETH": "ethereum",
  "0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226::coin::COIN": "ethereum",
};

async function getGeckoTerminalPrice(coinType: string): Promise<number | null> {
  try {
    const addr = coinType.split("::")[0];
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/sui-network/tokens/${addr}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data?.data?.attributes?.price_usd || "0");
    return price > 0 ? price : null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { coinTypes } = await req.json();
    if (!Array.isArray(coinTypes)) return NextResponse.json({ prices: {} });

    const prices: Record<string, number> = {};

    // 1. Stablecoins — hardcoded $1
    for (const ct of coinTypes) {
      if (STABLE_COINS[ct]) prices[ct] = STABLE_COINS[ct];
    }

    const needed = coinTypes.filter((ct: string) => !prices[ct]);
    if (needed.length === 0) return NextResponse.json({ prices });

    // 2. CoinGecko batch for known tokens
    const cgMap: Record<string, string[]> = {};
    for (const ct of needed) {
      const id = CG_IDS[ct];
      if (id) {
        if (!cgMap[id]) cgMap[id] = [];
        cgMap[id].push(ct);
      }
    }

    const ids = Object.keys(cgMap);
    if (ids.length > 0) {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`,
          { next: { revalidate: 60 } }
        );
        if (res.ok) {
          const data = await res.json();
          for (const [id, cts] of Object.entries(cgMap)) {
            if (data[id]?.usd) {
              for (const ct of cts as string[]) prices[ct] = data[id].usd;
            }
          }
        }
      } catch {}
    }

    // 3. GeckoTerminal fallback for ALL remaining tokens (including unknown ones)
    const stillNeeded = needed.filter((ct: string) => !prices[ct]);
    if (stillNeeded.length > 0) {
      await Promise.all(stillNeeded.map(async (ct: string) => {
        const price = await getGeckoTerminalPrice(ct);
        if (price !== null) prices[ct] = price;
      }));
    }

    return NextResponse.json({ prices });
  } catch (e: any) {
    return NextResponse.json({ prices: {}, error: e.message });
  }
}
