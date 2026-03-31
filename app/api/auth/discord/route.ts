import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return protocol + "://" + host;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const BASE_URL = getBaseUrl(req);
  const REDIRECT_URI = BASE_URL + "/api/auth/discord";

  if (error) {
    return NextResponse.redirect(BASE_URL + "/auth/discord/callback?error=" + error);
  }

  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "identify",
    });
    return NextResponse.redirect("https://discord.com/api/oauth2/authorize?" + params.toString());
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(BASE_URL + "/auth/discord/callback?error=no_token");
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: "Bearer " + tokenData.access_token },
    });
    const userData = await userRes.json();
    const username = userData.username;

    if (!username) {
      return NextResponse.redirect(BASE_URL + "/auth/discord/callback?error=no_username");
    }

    return NextResponse.redirect(BASE_URL + "/auth/discord/callback?discord_username=" + encodeURIComponent(username) + "&success=true");

  } catch (e: any) {
    return NextResponse.redirect(BASE_URL + "/auth/discord/callback?error=exception");
  }
}