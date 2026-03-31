import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return protocol + "://" + host;
}

function verifyTelegramAuth(data: Record<string, string>): boolean {
  const { hash, ...rest } = data;
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const checkString = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join("\n");
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
  return hmac === hash;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const BASE_URL = getBaseUrl(req);

  const data: Record<string, string> = {};
  searchParams.forEach((val, key) => { data[key] = val; });

  const { hash, id, username, first_name } = data;

  if (!hash || !id) {
    return NextResponse.redirect(BASE_URL + "/auth/telegram/callback?error=no_data");
  }

  if (!verifyTelegramAuth(data)) {
    return NextResponse.redirect(BASE_URL + "/auth/telegram/callback?error=invalid_hash");
  }

  const displayName = username || first_name || id;
  return NextResponse.redirect(BASE_URL + "/auth/telegram/callback?telegram_username=" + encodeURIComponent(displayName) + "&success=true");
}