import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const { text } = await generateText({
      model: anthropic("claude-opus-4-5"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a world-class TCG card expert. Analyze this trading card image and identify it precisely.

Return ONLY a valid JSON object (no markdown, no explanation):
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
Return ONLY the JSON.`,
            },
            {
              type: "image",
              image: `data:image/jpeg;base64,${image}`,
            },
          ],
        },
      ],
    });

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
