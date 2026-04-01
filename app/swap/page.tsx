"use client";
import { useEffect } from "react";

const DEXS = [
  { name: "Cetus", url: "https://app.cetus.zone/swap", color: "#0099ff", desc: "Best rates · Aggregates all DEXs", icon: "🐟" },
  { name: "Aftermath", url: "https://aftermath.finance/trade", color: "#00d4ff", desc: "suiUSDe native · Deep liquidity", icon: "🌊" },
  { name: "Turbos", url: "https://app.turbos.finance/#/trade", color: "#ff6b35", desc: "Fast swaps · Low fees", icon: "🔥" },
  { name: "Bluefin", url: "https://trade.bluefin.io", color: "#0055ff", desc: "Pro trading · suiUSDe", icon: "🐬" },
  { name: "Kriya", url: "https://www.kriya.finance/trade", color: "#7b2dff", desc: "Concentrated liquidity", icon: "💜" },
  { name: "FlowX", url: "https://flowx.finance/swap", color: "#00ffcc", desc: "Multi-hop routing", icon: "⚡" },
];

const PAIRS = [
  { from: "SUI", to: "USDC" },
  { from: "SUI", to: "USDT" },
  { from: "SUI", to: "wETH" },
  { from: "SUI", to: "wBTC" },
  { from: "SUI", to: "CETUS" },
  { from: "USDC", to: "wETH" },
];

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
    <div style={{ minHeight: "100vh", background: "#000008", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "50px 48px 32px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px" }}>◈ WaveTCG · Sui DeFi</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px" }}>Swap Tokens</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0" }}>Best rates on Sui · Connect wallet and swap directly</p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "480px 1fr", gap: "32px", alignItems: "start" }}>

        {/* LEFT - Cetus Terminal */}
        <div style={{ overflow: "hidden", maxWidth: "100%", background: "#000008" }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#0099ff" }}>🐟</span> Swap with Cetus
            <span style={{ fontSize: "10px", background: "rgba(0,255,204,0.1)", color: "#00ffcc", padding: "2px 8px", borderRadius: "8px", border: "1px solid rgba(0,255,204,0.2)" }}>BEST RATES</span>
          </div>
          <div id="cetus-terminal" style={{ width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,153,255,0.2)" }} />
        </div>

        {/* RIGHT - Other DEXs + Popular Pairs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "16px" }}>Other DEXs on Sui</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              {DEXS.map((dex, i) => (
                <a key={i} href={dex.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = dex.color; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{dex.icon}</span>
                        <span style={{ fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{dex.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: dex.color }}>↗</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{dex.desc}</div>
                    <div style={{ marginTop: "10px", height: "2px", borderRadius: "2px", background: `linear-gradient(90deg, ${dex.color}, transparent)` }} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Popular Pairs */}
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "14px" }}>🔥 Popular Pairs</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              {PAIRS.map((pair, i) => (
                <a key={i} href={`https://app.cetus.zone/swap?from=0x2::sui::SUI&to=usdc`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0a1628", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "8px", cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.35)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.1)"}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{pair.from}/{pair.to}</span>
                    <span style={{ fontSize: "10px", color: "#0099ff" }}>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* suiUSDe info */}
          <div style={{ background: "linear-gradient(135deg, #000d20, #000520)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#00d4ff", marginBottom: "8px" }}>◈ About suiUSDe</div>
            <p style={{ fontSize: "12px", color: "#c8d8f0", lineHeight: 1.7, marginBottom: "10px" }}>suiUSDe is Sui's native yield-bearing stablecoin powered by Ethena Labs. Supported by Cetus, Aftermath, Bluefin, Navi & more.</p>
            <a href="https://aftermath.finance" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#00d4ff", textDecoration: "none" }}>Learn more →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
