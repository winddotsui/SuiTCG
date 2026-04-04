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
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #000008; }
        .swap-dex-card { transition: all 0.2s; }
        .swap-dex-card:hover { transform: translateX(4px); }
        .swap-pair:hover { border-color: rgba(0,153,255,0.4) !important; background: #0d1f3a !important; }
        @media (max-width: 1024px) {
          .swap-grid { grid-template-columns: 1fr !important; }
          .swap-terminal { max-width: 500px; margin: 0 auto; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000008" }}>

        {/* ── HERO HEADER — no white gap ── */}
        <div style={{
          background: "linear-gradient(180deg, #000520 0%, #000d20 60%, #000008 100%)",
          padding: "40px 48px 32px",
          borderBottom: "1px solid rgba(0,153,255,0.12)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* subtle glow behind title */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "200px", background: "radial-gradient(ellipse, rgba(0,100,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px", position: "relative" }}>◈ WaveTCG · Sui DeFi</div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 3vw, 52px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px", position: "relative" }}>Swap Tokens</h1>
          <p style={{ fontSize: "14px", color: "#6b85a8", position: "relative" }}>Best rates on Sui · Connect wallet and swap directly</p>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="swap-grid" style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "36px 32px",
          display: "grid",
          gridTemplateColumns: "500px 1fr",
          gap: "28px",
          alignItems: "start",
        }}>

          {/* LEFT — Cetus Terminal */}
          <div className="swap-terminal">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "18px" }}>🐟</span>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Swap with Cetus</span>
              <span style={{ fontSize: "10px", background: "rgba(0,255,204,0.08)", color: "#00ffcc", padding: "2px 10px", borderRadius: "20px", border: "1px solid rgba(0,255,204,0.2)", fontWeight: 600, letterSpacing: "0.05em" }}>BEST RATES</span>
            </div>
            <div id="cetus-terminal" style={{ width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,153,255,0.2)", background: "#000008" }} />
          </div>

          {/* RIGHT — DEXs + Pairs + Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Other DEXs */}
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#c8d8f0", marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "11px" }}>Other DEXs on Sui</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {DEXS.map((dex, i) => (
                  <a key={i} href={dex.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div className="swap-dex-card" style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.12)", borderRadius: "12px", padding: "14px 16px", cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = dex.color; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.12)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <span style={{ fontSize: "16px" }}>{dex.icon}</span>
                          <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>{dex.name}</span>
                        </div>
                        <span style={{ fontSize: "12px", color: dex.color }}>↗</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b85a8", marginBottom: "8px" }}>{dex.desc}</div>
                      <div style={{ height: "2px", borderRadius: "2px", background: `linear-gradient(90deg, ${dex.color}, transparent)` }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Pairs + suiUSDe side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Popular Pairs */}
              <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.12)", borderRadius: "14px", padding: "16px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "12px", color: "#ffffff", marginBottom: "12px", letterSpacing: "0.06em" }}>🔥 Popular Pairs</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {PAIRS.map((pair, i) => (
                    <a key={i} href="https://app.cetus.zone/swap" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div className="swap-pair" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0a1628", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{pair.from}<span style={{ color: "#0099ff", margin: "0 4px" }}>/</span>{pair.to}</span>
                        <span style={{ fontSize: "10px", color: "#0099ff" }}>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* suiUSDe info */}
              <div style={{ background: "linear-gradient(160deg, #000d20, #000520)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "12px", color: "#00d4ff", marginBottom: "10px", letterSpacing: "0.06em" }}>◈ About suiUSDe</div>
                  <p style={{ fontSize: "11.5px", color: "#6b85a8", lineHeight: 1.7, marginBottom: "14px" }}>
                    Sui's native yield-bearing stablecoin by Ethena Labs. Supported by Cetus, Aftermath, Bluefin, Navi & more.
                  </p>
                </div>
                {/* mini stat pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                  {[["APY", "~8–12%", "#00ffcc"], ["Backed by", "USDe", "#0099ff"], ["Networks", "Sui", "#00d4ff"]].map(([label, val, color]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "rgba(0,153,255,0.05)", borderRadius: "6px", border: "1px solid rgba(0,153,255,0.08)" }}>
                      <span style={{ fontSize: "11px", color: "#6b85a8" }}>{label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: color as string }}>{val}</span>
                    </div>
                  ))}
                </div>
                <a href="https://aftermath.finance" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontSize: "11px", color: "#00d4ff", textDecoration: "none", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px", padding: "6px 12px", textAlign: "center", transition: "all 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,212,255,0.08)"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
                  Learn more →
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
