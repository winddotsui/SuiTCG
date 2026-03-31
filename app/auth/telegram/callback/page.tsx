"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

function TelegramCallbackInner() {
  const [status, setStatus] = useState("Connecting Telegram...");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const username = searchParams.get("telegram_username");
      const success = searchParams.get("success");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Error: " + errorParam);
        setStatus("Telegram connection failed.");
        return;
      }

      if (!success || !username) {
        setError("Connection failed. Please try again.");
        setStatus("Telegram connection failed.");
        return;
      }

      setStatus("Connected as @" + username + "! Redirecting...");

      const walletAddress = localStorage.getItem("wavetcg_wallet_address");
      if (walletAddress) {
        await supabase.from("profiles").upsert({
          wallet_address: walletAddress,
          telegram: username,
        }, { onConflict: "wallet_address" });
      }

      setTimeout(() => router.back(), 2000);
    }
    handleCallback();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", padding: "24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>✈️</div>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#e6e4f0", marginBottom: "8px" }}>WaveTCG</div>
        <div style={{ fontSize: "14px", color: "#888898", marginBottom: "16px" }}>{status}</div>
        {error && (
          <div style={{ background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.3)", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#e05555", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        {error && (
          <button onClick={() => router.back()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 20px", color: "#888898", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Go Back</button>
        )}
      </div>
    </div>
  );
}

export default function TelegramCallback() {
  return (
    <Suspense>
      <TelegramCallbackInner />
    </Suspense>
  );
}