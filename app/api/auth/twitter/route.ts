import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!;

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

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const BASE_URL = getBaseUrl(req);
  const REDIRECT_URI = BASE_URL + "/api/auth/twitter";

  if (error) {
    return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?error=" + error);
  }

  if (!code) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const stateParam = generateState();

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "tweet.read users.read",
      state: stateParam,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const response = NextResponse.redirect("https://twitter.com/i/oauth2/authorize?" + params.toString());
    response.cookies.set("twitter_code_verifier", codeVerifier, { httpOnly: true, maxAge: 600, sameSite: "lax" });
    response.cookies.set("twitter_state", stateParam, { httpOnly: true, maxAge: 600, sameSite: "lax" });
    return response;
  }

  const codeVerifier = req.cookies.get("twitter_code_verifier")?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?error=no_verifier");
  }

  try {
    // Native App uses PKCE without client secret
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
        client_id: CLIENT_ID,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    console.log("Token response:", JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?error=no_token&detail=" + encodeURIComponent(JSON.stringify(tokenData)));
    }

    const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=username,name", {
      headers: { Authorization: "Bearer " + tokenData.access_token },
    });
    const userData = await userRes.json();
    const username = userData.data?.username;

    if (!username) {
      return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?error=no_username");
    }

    return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?twitter_username=" + username + "&success=true");

  } catch (e: any) {
    console.error("Twitter OAuth error:", e);
    return NextResponse.redirect(BASE_URL + "/auth/twitter/callback?error=exception&detail=" + encodeURIComponent(e.message));
  }
}
