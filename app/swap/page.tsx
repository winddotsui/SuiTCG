"use client";
import { useEffect } from "react";

export default function SwapPage() {
  useEffect(() => {
    // Dynamically import Cetus Terminal CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://terminal.cetus.zone/main.css";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Sui DeFi</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Swap Tokens</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Swap SUI, USDC, suiUSDe and more · Powered by Cetus Terminal · Best rates on Sui</p>
      </div>

      {/* Cetus Terminal Widget */}
      <div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 24px" }}>
        <CetusTerminal />
      </div>
    </div>
  );
}

function CetusTerminal() {
  useEffect(() => {
    // Load Cetus Terminal script
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://terminal.cetus.zone/main.js";
      script.async = true;
      script.onload = () => {
        // Initialize Cetus Terminal after script loads
        if ((window as any).CetusTerminal) {
          (window as any).CetusTerminal.init({
            displayMode: "Integrated",
            integratedTargetId: "cetus-terminal",
            endpoint: "https://api-sui.cetus.zone",
            defaultInputCoin: "0x2::sui::SUI",
            defaultOutputCoin: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            appearance: "dark",
            theme: {
              primary: "#0099ff",
              secondary: "#00d4ff",
              background: "#050515",
              text: "#ffffff",
            },
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      id="cetus-terminal"
      style={{
        width: "100%",
        minHeight: "500px",
        background: "#050515",
        borderRadius: "20px",
        border: "1px solid rgba(0,153,255,0.2)",
        overflow: "hidden",
      }}
    />
  );
}
