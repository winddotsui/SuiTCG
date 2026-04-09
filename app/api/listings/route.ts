import { NextResponse } from "next/server";
import { rateLimit, getIP } from "../../../lib/rateLimit";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
// Fetch live SUI price
async function getSuiPrice(): Promise<number> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd", { next: { revalidate: 60 } });
    const data = await res.json();
    return data?.sui?.usd || 1.0;
  } catch { return 1.0; }
}
const RPC = process.env.NEXT_PUBLIC_SUI_RPC || "https://fullnode.mainnet.sui.io:443";

async function rpc(method: string, params: any[]) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  return json.result;
}

export async function GET() {
  try {
    const suiPrice = await getSuiPrice();
    // Get all ListingCreated events
    const events = await rpc("suix_queryEvents", [
      { MoveEventType: `${CONTRACT_ID}::marketplace::ListingCreated` },
      null, 50, true
    ]);

    const listings = await Promise.all((events?.data || []).map(async (e: any) => {
      const p = e.parsedJson;
      
      // Get listing object ID from tx
      const tx = await rpc("sui_getTransactionBlock", [
        e.id.txDigest,
        { showObjectChanges: true }
      ]);
      
      const changes = tx?.objectChanges || [];
      const listingObj = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("Listing")
      );

      // Check if listing is still active
      let isActive = true;
      if (listingObj?.objectId) {
        const objRes = await rpc("sui_getObject", [
          listingObj.objectId,
          { showContent: true }
        ]);
        const fields = objRes?.data?.content?.fields;
        isActive = fields?.is_active === true;
      }

      if (!isActive) return null;

      return {
        id: e.id.txDigest,
        listing_object_id: listingObj?.objectId || null,
        name: p.card_name,
        game: p.game,
        condition: p.condition || "NM",
        price_sui: Number(p.price_mist) / 1_000_000_000,
        price_usd: (Number(p.price_mist) / 1_000_000_000) * suiPrice,
        seller_address: p.seller,
        image_url: "",
        is_chain: true,
      };
    }));

    return NextResponse.json({ listings: listings.filter(Boolean) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ listings: [], error: String(err) });
  }
}
