"use client";
import { useState } from "react";

const SUI_TOKENS = [
  { symbol: "SUI", name: "Sui", icon: "◈", color: "#0099ff", address: "0x2::sui::SUI" },
  { symbol: "suiUSDe", name: "eSui Dollar", icon: "$", color: "#00d4ff", address: "suiusde" },
  { symbol: "USDC", name: "USD Coin", icon: "◎", color: "#2775ca", address: "usdc" },
  { symbol: "USDT", name: "Tether", icon: "₮", color: "#26a17b", address: "usdt" },
  { symbol: "wBTC", name: "Wrapped Bitcoin", icon: "₿", color: "#f7931a", address: "wbtc" },
  { symbol: "wETH", name: "Wrapped Ethereum", icon: "Ξ", color: "#627eea", address: "weth" },
  { symbol: "CETUS", name: "Cetus Protocol", icon: "🐟", color: "#00d4ff", address: "cetus" },
  { symbol: "DEEP", name: "DeepBook", icon: "🌊", color: "#0055ff", address: "deep" },
  { symbol: "NAVX", name: "NAVI Protocol", icon: "🧭", color: "#0099ff", address: "navx" },
  { symbol: "BUCK", name: "Bucket Protocol", icon: "🪣", color: "#f0c040", address: "buck" },
];

const DEXS = [
  { name: "Cetus", url: "https://app.cetus.zone/swap", color: "#0099ff", desc: "Best rates · Aggregates all DEXs" },
  { name: "Aftermath", url: "https://aftermath.finance/trade", color: "#00d4ff", desc: "suiUSDe native · Deep liquidity" },
  { name: "Turbos", url: "https://app.turbos.finance/#/trade", color: "#ff6b35", desc: "Fast swaps · Low fees" },
  { name: "Bluefin", url: "https://trade.bluefin.io", color: "#0055ff", desc: "Pro trading · suiUSDe supported" },
  { name: "Kriya", url: "https://www.kriya.finance/trade", color: "#7b2dff", desc: "Concentrated liquidity" },
  { name: "FlowX", url: "https://flowx.finance/swap", color: "#00ffcc", desc: "Multi-hop routing" },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(SUI_TOKENS[0]);
  const [toToken, setToToken] = useState(SUI_TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  function swapTokens() {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  }

  function getSwapUrl(dex: typeof DEXS[0]) {
    if (dex.name === "Cetus") return dex.url + "?from=" + fromToken.address + "&to=" + toToken.address;
    if (dex.name === "Aftermath") return dex.url + "?coinIn=" + fromToken.symbol + "&coinOut=" + toToken.symbol;
    return dex.url;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Sui DeFi</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Swap Tokens</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Swap SUI, suiUSDe, USDC and more — powered by the best DEXs on Sui</p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "32px" }}>

        <div>
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", padding: "24px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "20px" }}>Swap</div>

            <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "8px", position: "relative" }}>
              <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>From</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#000d20", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", color: "#ffffff", fontFamily: "DM Sans, sans-serif", minWidth: "130px" }}>
                  <span style={{ fontSize: "18px", color: fromToken.color }}>{fromToken.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>{fromToken.symbol}</span>
                  <span style={{ marginLeft: "auto", color: "#c8d8f0", fontSize: "12px" }}>▾</span>
                </button>
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "24px", fontWeight: 600, color: "#ffffff", fontFamily: "Cinzel, serif", textAlign: "right" }} />
              </div>
              {showFromDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", zIndex: 100, marginTop: "4px", maxHeight: "200px", overflowY: "auto" }}>
                  {SUI_TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
                    <div key={token.symbol} onClick={() => { setFromToken(token); setShowFromDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,153,255,0.1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <span style={{ fontSize: "18px", color: token.color }}>{token.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{token.symbol}</div>
                        <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{token.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", margin: "4px 0" }}>
              <button onClick={swapTokens} style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "16px", color: "#0099ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>⇅</button>
            </div>

            <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "20px", position: "relative" }}>
              <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>To</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#000d20", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", color: "#ffffff", fontFamily: "DM Sans, sans-serif", minWidth: "130px" }}>
                  <span style={{ fontSize: "18px", color: toToken.color }}>{toToken.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>{toToken.symbol}</span>
                  <span style={{ marginLeft: "auto", color: "#c8d8f0", fontSize: "12px" }}>▾</span>
                </button>
                <div style={{ flex: 1, textAlign: "right", fontSize: "24px", fontWeight: 600, color: "#c8d8f0", fontFamily: "Cinzel, serif" }}>~</div>
              </div>
              {showToDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", zIndex: 100, marginTop: "4px", maxHeight: "200px", overflowY: "auto" }}>
                  {SUI_TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
                    <div key={token.symbol} onClick={() => { setToToken(token); setShowToDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,153,255,0.1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <span style={{ fontSize: "18px", color: token.color }}>{token.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{token.symbol}</div>
                        <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{token.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a href={getSwapUrl(DEXS[0])} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", color: "#fff", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none", fontFamily: "DM Sans, sans-serif", marginBottom: "12px", boxShadow: "0 4px 24px rgba(0,153,255,0.3)" }}>
              Swap {fromToken.symbol} → {toToken.symbol} on Cetus ↗
            </a>
            <div style={{ fontSize: "11px", color: "#c8d8f0", textAlign: "center" }}>Best rates · Aggregates Aftermath, Turbos, DeepBook & more</div>
          </div>

          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px", marginTop: "16px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#0099ff", marginBottom: "12px" }}>About suiUSDe</div>
            <p style={{ fontSize: "12px", color: "#c8d8f0", lineHeight: 1.7, marginBottom: "12px" }}>suiUSDe is Sui native synthetic dollar powered by Ethena Labs — the first non-EVM chain to host a yield-bearing stablecoin. Supported by Cetus, Aftermath, Bluefin, Navi, Scallop and more.</p>
            <a href="https://aftermath.finance" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#0099ff", textDecoration: "none" }}>Learn more on Aftermath →</a>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>Swap on any DEX</div>
          <p style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "24px" }}>Choose your preferred DEX — all support SUI & suiUSDe</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
            {DEXS.map((dex, i) => (
              <a key={i} href={getSwapUrl(dex)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = dex.color; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>{dex.name}</span>
                    <span style={{ fontSize: "11px", color: dex.color }}>↗</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#c8d8f0" }}>{dex.desc}</div>
                  <div style={{ marginTop: "12px", height: "3px", borderRadius: "2px", background: "linear-gradient(90deg, " + dex.color + ", transparent)" }} />
                </div>
              </a>
            ))}
          </div>

          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "16px" }}>Popular Pairs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { from: "SUI", to: "USDC" },
                { from: "SUI", to: "suiUSDe" },
                { from: "suiUSDe", to: "USDC" },
                { from: "SUI", to: "wETH" },
                { from: "USDC", to: "wBTC" },
                { from: "SUI", to: "CETUS" },
              ].map((pair, i) => (
                <button key={i} onClick={() => {
                  const from = SUI_TOKENS.find(t => t.symbol === pair.from);
                  const to = SUI_TOKENS.find(t => t.symbol === pair.to);
                  if (from) setFromToken(from);
                  if (to) setToToken(to);
                }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0a1628", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,153,255,0.3)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,153,255,0.1)"}
                >
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{pair.from}/{pair.to}</span>
                  <span style={{ fontSize: "11px", color: "#0099ff" }}>Select →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
