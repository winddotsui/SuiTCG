"use client";
import { useState, useEffect } from "react";

const SUI_TOKENS = [
  { symbol: "SUI", name: "Sui", icon: "◈", color: "#0099ff", coinType: "0x2::sui::SUI", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", icon: "◎", color: "#2775ca", coinType: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "₮", color: "#26a17b", coinType: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN", decimals: 6 },
  { symbol: "wETH", name: "Wrapped ETH", icon: "Ξ", color: "#627eea", coinType: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN", decimals: 8 },
  { symbol: "wBTC", name: "Wrapped BTC", icon: "₿", color: "#f7931a", coinType: "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN", decimals: 8 },
  { symbol: "CETUS", name: "Cetus Protocol", icon: "🐟", color: "#00d4ff", coinType: "0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS", decimals: 9 },
  { symbol: "DEEP", name: "DeepBook", icon: "🌊", color: "#0055ff", coinType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946b270::deep::DEEP", decimals: 6 },
];

const DEXS = [
  { name: "Cetus", url: "https://app.cetus.zone/swap", color: "#0099ff", desc: "Best rates · Aggregates all DEXs", recommended: true },
  { name: "Aftermath", url: "https://aftermath.finance/trade", color: "#00d4ff", desc: "suiUSDe native · Deep liquidity", recommended: false },
  { name: "Turbos", url: "https://app.turbos.finance/#/trade", color: "#ff6b35", desc: "Fast swaps · Low fees", recommended: false },
  { name: "Bluefin", url: "https://trade.bluefin.io", color: "#0055ff", desc: "Pro trading", recommended: false },
  { name: "Kriya", url: "https://www.kriya.finance/trade", color: "#7b2dff", desc: "Concentrated liquidity", recommended: false },
  { name: "FlowX", url: "https://flowx.finance/swap", color: "#00ffcc", desc: "Multi-hop routing", recommended: false },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(SUI_TOKENS[0]);
  const [toToken, setToToken] = useState(SUI_TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchQuote();
    } else {
      setQuote(null);
    }
  }, [amount, fromToken, toToken]);

  async function fetchQuote() {
    setQuoteLoading(true);
    try {
      // Use Cetus aggregator API for quote
      const amountIn = Math.floor(parseFloat(amount) * Math.pow(10, fromToken.decimals));
      const res = await fetch(
        `https://api-sui.cetus.zone/router/v2/find_routes?from=${fromToken.coinType}&target=${toToken.coinType}&amount=${amountIn}&byAmountIn=true`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      if (data.data?.amountOut) {
        const amountOut = parseInt(data.data.amountOut) / Math.pow(10, toToken.decimals);
        setQuote(amountOut.toFixed(toToken.decimals > 6 ? 6 : 2));
      } else {
        setQuote(null);
      }
    } catch {
      setQuote(null);
    }
    setQuoteLoading(false);
  }

  function swapTokens() {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount("");
    setQuote(null);
  }

  function getCetusSwapUrl() {
    return `https://app.cetus.zone/swap?from=${fromToken.coinType}&to=${toToken.coinType}${amount ? "&amount=" + amount : ""}`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Sui DeFi</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Swap Tokens</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Get real-time quotes · Powered by Cetus Aggregator on Sui</p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "420px 1fr", gap: "32px" }}>

        {/* Swap Widget */}
        <div>
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff" }}>Swap</div>
              <div style={{ fontSize: "11px", color: "#0099ff", background: "rgba(0,153,255,0.1)", padding: "4px 10px", borderRadius: "12px" }}>Cetus Aggregator</div>
            </div>

            {/* From */}
            <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "8px", position: "relative" }}>
              <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>From</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#000d20", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", color: "#ffffff", fontFamily: "DM Sans, sans-serif", minWidth: "140px" }}>
                  <span style={{ fontSize: "18px", color: fromToken.color }}>{fromToken.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>{fromToken.symbol}</span>
                  <span style={{ marginLeft: "auto", color: "#c8d8f0" }}>▾</span>
                </button>
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" min="0"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "24px", fontWeight: 600, color: "#ffffff", fontFamily: "Cinzel, serif", textAlign: "right" }} />
              </div>
              {showFromDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", zIndex: 100, marginTop: "4px", maxHeight: "240px", overflowY: "auto" }}>
                  {SUI_TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
                    <div key={token.symbol} onClick={() => { setFromToken(token); setShowFromDropdown(false); setQuote(null); }}
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,153,255,0.08)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                      <span style={{ fontSize: "20px", color: token.color }}>{token.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{token.symbol}</div>
                        <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{token.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap arrow */}
            <div style={{ textAlign: "center", margin: "6px 0" }}>
              <button onClick={swapTokens} style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "18px", color: "#0099ff", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#000d20"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#0a1628"}>⇅</button>
            </div>

            {/* To */}
            <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "20px", position: "relative" }}>
              <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>To (estimated)</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#000d20", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", color: "#ffffff", fontFamily: "DM Sans, sans-serif", minWidth: "140px" }}>
                  <span style={{ fontSize: "18px", color: toToken.color }}>{toToken.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>{toToken.symbol}</span>
                  <span style={{ marginLeft: "auto", color: "#c8d8f0" }}>▾</span>
                </button>
                <div style={{ flex: 1, textAlign: "right", fontSize: "24px", fontWeight: 600, color: quote ? "#00ffcc" : "#c8d8f0", fontFamily: "Cinzel, serif" }}>
                  {quoteLoading ? "..." : quote || "~"}
                </div>
              </div>
              {showToDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", zIndex: 100, marginTop: "4px", maxHeight: "240px", overflowY: "auto" }}>
                  {SUI_TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
                    <div key={token.symbol} onClick={() => { setToToken(token); setShowToDropdown(false); setQuote(null); }}
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,153,255,0.08)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                      <span style={{ fontSize: "20px", color: token.color }}>{token.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{token.symbol}</div>
                        <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{token.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quote info */}
            {quote && amount && (
              <div style={{ background: "rgba(0,255,204,0.05)", border: "1px solid rgba(0,255,204,0.15)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "12px", color: "#c8d8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Rate</span>
                  <span style={{ color: "#00ffcc" }}>1 {fromToken.symbol} ≈ {(parseFloat(quote) / parseFloat(amount)).toFixed(4)} {toToken.symbol}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Route</span>
                  <span style={{ color: "#0099ff" }}>Cetus Aggregator (best price)</span>
                </div>
              </div>
            )}

            {/* Execute swap button */}
            <a href={getCetusSwapUrl()} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", color: "#fff", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none", fontFamily: "DM Sans, sans-serif", marginBottom: "10px", boxShadow: "0 4px 24px rgba(0,153,255,0.3)" }}>
              Swap on Cetus ↗
            </a>
            <div style={{ fontSize: "11px", color: "#8899bb", textAlign: "center" }}>Opens Cetus with your selected tokens pre-filled · Connect wallet there to execute</div>
          </div>
        </div>

        {/* DEX Options + Popular Pairs */}
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>Choose your DEX</div>
          <p style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "20px" }}>All support SUI · suiUSDe supported on Cetus, Aftermath & Bluefin</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
            {DEXS.map((dex, i) => (
              <a key={i} href={dex.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ background: "#050515", border: `1px solid rgba(0,153,255,0.15)`, borderRadius: "14px", padding: "18px", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = dex.color; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}>
                  {dex.recommended && <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "9px", background: "rgba(0,255,204,0.15)", color: "#00ffcc", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>BEST</div>}
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>{dex.name}</div>
                  <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "10px" }}>{dex.desc}</div>
                  <div style={{ height: "2px", borderRadius: "2px", background: `linear-gradient(90deg, ${dex.color}, transparent)` }} />
                </div>
              </a>
            ))}
          </div>

          {/* Popular pairs */}
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "14px" }}>🔥 Popular Pairs</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { from: "SUI", to: "USDC" },
                { from: "SUI", to: "USDT" },
                { from: "SUI", to: "wETH" },
                { from: "SUI", to: "wBTC" },
                { from: "USDC", to: "wBTC" },
                { from: "SUI", to: "CETUS" },
                { from: "SUI", to: "DEEP" },
                { from: "USDC", to: "wETH" },
              ].map((pair, i) => (
                <button key={i} onClick={() => {
                  const from = SUI_TOKENS.find(t => t.symbol === pair.from);
                  const to = SUI_TOKENS.find(t => t.symbol === pair.to);
                  if (from) setFromToken(from);
                  if (to) setToToken(to);
                  setQuote(null);
                  setAmount("");
                }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0a1628", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,153,255,0.35)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,153,255,0.1)"}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{pair.from}/{pair.to}</span>
                  <span style={{ fontSize: "10px", color: "#0099ff" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
