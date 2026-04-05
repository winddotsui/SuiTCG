import { NextResponse } from "next/server";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const RPC = "https://fullnode.testnet.sui.io:443";

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

      return {
        id: e.id.txDigest,
        listing_object_id: listingObj?.objectId || null,
        name: p.card_name,
        game: p.game,
        condition: p.condition || "NM",
        price_sui: Number(p.price_mist) / 1_000_000_000,
        price_usd: (Number(p.price_mist) / 1_000_000_000) * 3.5,
        seller_address: p.seller,
        image_url: "",
        is_chain: true,
      };
    }));

    return NextResponse.json({ listings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ listings: [], error: String(err) });
  }
}
