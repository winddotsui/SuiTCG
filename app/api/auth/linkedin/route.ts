import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return protocol + "://" + host;
}

function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const BASE_URL = getBaseUrl(req);
  const REDIRECT_URI = BASE_URL + "/api/auth/linkedin";

  if (error) {
    return NextResponse.redirect(BASE_URL + "/auth/linkedin/callback?error=" + error);
  }

  if (!code) {
    const state = generateState();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: state,
      scope: "openid profile",
    });
    const response = NextResponse.redirect("https://www.linkedin.com/oauth/v2/authorization?" + params.toString());
    response.cookies.set("linkedin_state", state, { httpOnly: true, maxAge: 600, sameSite: "lax" });
    return response;
  }

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(BASE_URL + "/auth/linkedin/callback?error=no_token&detail=" + encodeURIComponent(JSON.stringify(tokenData)));
    }

    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: "Bearer " + tokenData.access_token },
    });
    const userData = await userRes.json();
    const name = userData.name || userData.given_name + " " + userData.family_name;
    const linkedinUrl = userData.sub;

    return NextResponse.redirect(BASE_URL + "/auth/linkedin/callback?linkedin_name=" + encodeURIComponent(name) + "&linkedin_id=" + encodeURIComponent(linkedinUrl) + "&success=true");

  } catch (e: any) {
    return NextResponse.redirect(BASE_URL + "/auth/linkedin/callback?error=exception&detail=" + encodeURIComponent(e.message));
  }
}