"use client";
import { useState, useEffect } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function ZkLogin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("wavetcg_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  async function loginWithGoogle() {
    setLoading(true);
    try {
      const zklogin = await import("@mysten/zklogin");
      const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");

      const res = await fetch("https://fullnode.testnet.sui.io:443", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "suix_getLatestSuiSystemState", params: [] }),
      });
      const data = await res.json();
      const epoch = data.result?.epoch || "0";

      const maxEpoch = Number(epoch) + 2;
      const keypair = new Ed25519Keypair();
      const randomness = zklogin.generateRandomness();
      const nonce = zklogin.generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

      localStorage.setItem("wavetcg_zklogin_secret", keypair.getSecretKey());
      localStorage.setItem("wavetcg_zklogin_randomness", randomness.toString());
      localStorage.setItem("wavetcg_zklogin_maxepoch", maxEpoch.toString());

      const redirectUri = window.location.origin + "/auth/callback";
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "id_token",
        scope: "openid email profile",
        nonce,
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } catch (e: any) {
      console.error("zkLogin error:", e);
      alert("Login error: " + e.message);
      setLoading(false);
    }
  }

  function logout() {
    try {
      localStorage.removeItem("wavetcg_user");
      localStorage.removeItem("wavetcg_zklogin_secret");
      localStorage.removeItem("wavetcg_zklogin_randomness");
      localStorage.removeItem("wavetcg_zklogin_maxepoch");
    } catch {}
    setUser(null);
  }

  if (!mounted) return null;

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: "rgba(77,162,255,0.15)",
          border: "1px solid rgba(77,162,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", color: "#78bfff",
        }}>
          {user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <button onClick={logout} style={{
          background: "transparent", border: "none",
          color: "#888898", fontSize: "11px", cursor: "pointer",
          fontFamily: "DM Sans, sans-serif",
        }}>Sign Out</button>
      </div>
    );
  }

  return (
    <button
      onClick={loginWithGoogle}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "6px", padding: "7px 12px",
        fontSize: "11px", color: "#888898",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "DM Sans, sans-serif",
        opacity: loading ? 0.5 : 1,
      }}>
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? "Signing in..." : "Google Login"}
    </button>
  );
}
