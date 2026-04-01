"use client";
import { useEffect } from "react";

export default function SwapPage() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://archive.cetus.zone/assets/terminal/style.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://archive.cetus.zone/assets/terminal/main.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).CetusSwap) {
        (window as any).CetusSwap.init({
          containerId: "cetus-terminal",
          independentWallet: true,
          displayMode: "Integrated",
          defaultInputCoin: "0x2::sui::SUI",
          defaultOutputCoin: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
        });
      }
    };
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      {/* Header */}
      <div style={{ paddingTop: "60px", paddingBottom: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "8px" }}>◈ WaveTCG · Sui DeFi</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Swap Tokens</h1>
        <p style={{ fontSize: "13px", color: "#c8d8f0", marginTop: "8px" }}>Powered by Cetus · Best rates on Sui</p>
      </div>

      {/* Widget - fixed size, centered */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ width: "460px", height: "480px", overflow: "hidden", borderRadius: "16px", position: "relative" }}>
          <div id="cetus-terminal" style={{ width: "460px", position: "absolute", top: 0, left: 0 }} />
        </div>
      </div>

      {/* DEX links */}
      <div style={{ textAlign: "center", marginTop: "32px", paddingBottom: "40px" }}>
        <div style={{ fontSize: "12px", color: "#c8d8f0", marginBottom: "12px" }}>Or swap directly on these DEXs</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { name: "Cetus", url: "https://app.cetus.zone/swap", color: "#0099ff" },
            { name: "Aftermath", url: "https://aftermath.finance/trade", color: "#00d4ff" },
            { name: "Turbos", url: "https://app.turbos.finance/#/trade", color: "#ff6b35" },
            { name: "Bluefin", url: "https://trade.bluefin.io", color: "#0055ff" },
            { name: "Kriya", url: "https://www.kriya.finance/trade", color: "#7b2dff" },
          ].map((dex, i) => (
            <a key={i} href={dex.url} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 18px", borderRadius: "20px", border: `1px solid ${dex.color}40`, color: dex.color, fontSize: "12px", fontWeight: 600, textDecoration: "none", background: `${dex.color}10` }}>
              {dex.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
