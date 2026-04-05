import { NextResponse } from "next/server";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const RPC = process.env.NEXT_PUBLIC_SUI_RPC || "https://fullnode.testnet.sui.io:443";

async function rpc(method: string, params: any[]) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  return json.result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listing_id");
  const sellerAddress = searchParams.get("seller");

  try {
    // Get all OfferMade events
    const events = await rpc("suix_queryEvents", [
      { MoveEventType: `${CONTRACT_ID}::marketplace::OfferMade` },
      null, 50, true
    ]);

    let offers = await Promise.all((events?.data || []).map(async (e: any) => {
      const p = e.parsedJson;

      // Filter by listing or seller if provided
      if (listingId && p.listing_id !== listingId) return null;
      if (sellerAddress && p.seller !== sellerAddress) return null;

      // Get offer object to check if still active
      const tx = await rpc("sui_getTransactionBlock", [
        e.id.txDigest,
        { showObjectChanges: true }
      ]);
      const changes = tx?.objectChanges || [];
      const offerObj = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("::marketplace::Offer")
      );

      if (!offerObj?.objectId) return null;

      // Check if offer is still active
      const obj = await rpc("sui_getObject", [
        offerObj.objectId,
        { showContent: true }
      ]);
      const fields = obj?.data?.content?.fields;
      if (!fields?.is_active) return null;

      return {
        id: e.id.txDigest,
        offer_object_id: offerObj.objectId,
        listing_id: p.listing_id,
        buyer: p.buyer,
        seller: p.seller,
        offer_sui: Number(p.offer_mist) / 1_000_000_000,
        offer_mist: p.offer_mist,
        is_active: fields?.is_active,
      };
    }));

    offers = offers.filter(Boolean);
    return NextResponse.json({ offers }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return NextResponse.json({ offers: [], error: String(err) });
  }
}
