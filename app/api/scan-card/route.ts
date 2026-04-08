import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Detect actual image type from data URL
    let mediaType = "image/jpeg";
    let base64 = image;
    if (image.includes(",")) {
      const header = image.split(",")[0];
      base64 = image.split(",")[1];
      if (header.includes("webp")) mediaType = "image/webp";
      else if (header.includes("png")) mediaType = "image/png";
      else if (header.includes("gif")) mediaType = "image/gif";
      else if (header.includes("jpeg") || header.includes("jpg")) mediaType = "image/jpeg";
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64,
                },
              },
              {
                type: "text",
                text: `You are a world-class TCG card expert. Analyze this trading card image and identify it precisely.

Return ONLY a valid JSON object (no markdown, no explanation, no backticks):
{
  "name": "exact card name",
  "game": "One Piece TCG or Pokemon TCG or Magic: The Gathering or Yu-Gi-Oh! or Dragon Ball Super or Digimon TCG or Lorcana or Flesh and Blood or other",
  "set": "set name or null",
  "number": "card number like OP01-001 or null",
  "rarity": "Common or Uncommon or Rare or Super Rare or Secret Rare or null",
  "condition": "NM or LP or MP or HP or DMG",
  "price": "estimated USD price as number string like 12.50 or null",
  "description": "one sentence about this cards value for sellers",
  "confidence": "high or medium or low"
}
Condition: NM=Near Mint, LP=Light Play, MP=Moderate Play, HP=Heavy Play, DMG=Damaged.
Return ONLY the JSON object.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Scan error:", e);
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: "Could not identify card. Please try a clearer photo." }, { status: 422 });
    }
    return NextResponse.json({ error: e.message || "Scan failed" }, { status: 500 });
  }
}
