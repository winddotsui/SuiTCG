import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd",
      { next: { revalidate: 60 } } // cache for 60 seconds
    );
    const data = await res.json();
    const price = data?.sui?.usd || 0.87;
    return NextResponse.json({ price }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch {
    return NextResponse.json({ price: 0.87 }); // fallback
  }
}
