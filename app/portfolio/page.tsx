"use client";
import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { showSuccess, showError } from "../../lib/toast";

const COLORS = ["#0099ff","#00d4ff","#00ff88","#ffcc00","#ff6b6b","#a78bfa","#f472b6","#34d399","#fb923c","#60a5fa"];

const SUI_COINGECKO_IDS: Record<string, string> = {
  "0x2::sui::SUI": "sui",
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN": "usd-coin",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN": "tether",
};

interface TokenHolding {
  coinType: string;
  symbol: string;
  name: string;
  iconUrl: string | null;
  balance: number;
  decimals: number;
  price: number | null;
  value: number | null;
  pct: number;
}

function truncate(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function PortfolioPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"value" | "balance" | "symbol">("value");
  const [copied, setCopied] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      const balances = await client.getAllBalances({ owner: account.address });

      const holdingsRaw: TokenHolding[] = await Promise.all(
        balances.map(async (b) => {
          let symbol = b.coinType.split("::").pop() || "?";
          let name = symbol;
          let decimals = 9;
          let iconUrl = null;

          try {
            const meta = await client.getCoinMetadata({ coinType: b.coinType });
            if (meta) {
              symbol = meta.symbol || symbol;
              name = meta.name || name;
              decimals = meta.decimals ?? 9;
              iconUrl = meta.iconUrl || null;
            }
          } catch {}

          const balance = Number(b.totalBalance) / 10 ** decimals;
          return { coinType: b.coinType, symbol, name, iconUrl, balance, decimals, price: null, value: null, pct: 0 };
        })
      );

      // Fetch prices from CoinGecko
      const coinIds = holdingsRaw
        .map(h => SUI_COINGECKO_IDS[h.coinType])
        .filter(Boolean)
        .join(",");

      let prices: Record<string, { usd: number }> = {};
      if (coinIds) {
        try {
          const res = await fetch(`/api/sui-price?ids=${coinIds}`);
          const data = await res.json();
          prices = data.prices || {};
        } catch {}
      }

      // Also fetch SUI price
      try {
        const suiRes = await fetch("/api/sui-price");
        const suiData = await suiRes.json();
        if (suiData.price) prices["sui"] = { usd: suiData.price };
      } catch {}

      const withPrices = holdingsRaw.map(h => {
        const cgId = SUI_COINGECKO_IDS[h.coinType];
        const price = cgId && prices[cgId] ? prices[cgId].usd : null;
        const value = price !== null ? h.balance * price : null;
        return { ...h, price, value };
      });

      const totalValue = withPrices.reduce((sum, h) => sum + (h.value || 0), 0);
      const final = withPrices
        .map(h => ({ ...h, pct: totalValue > 0 && h.value ? (h.value / totalValue) * 100 : 0 }))
        .filter(h => h.balance > 0);

      setHoldings(final);
      setLastUpdated(new Date());
    } catch (e) {
      showError("Failed to fetch portfolio");
    }
    setLoading(false);
  }, [account?.address, client]);

  useEffect(() => {
    if (account?.address) fetchPortfolio();
  }, [account?.address]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (account?.address) fetchPortfolio();
    }, 30000);
    return () => clearInterval(interval);
  }, [account?.address, fetchPortfolio]);

  const sorted = [...holdings].sort((a, b) => {
    if (sortBy === "value") return (b.value || 0) - (a.value || 0);
    if (sortBy === "balance") return b.balance - a.balance;
    return a.symbol.localeCompare(b.symbol);
  });

  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
  const pieData = holdings.filter(h => h.value && h.value > 0).map(h => ({ name: h.symbol, value: h.value || 0 }));

  function exportCSV() {
    const rows = [["Symbol", "Name", "Balance", "Price (USD)", "Value (USD)", "Allocation %"]];
    sorted.forEach(h => rows.push([h.symbol, h.name, fmt(h.balance, 4), h.price ? fmt(h.price, 4) : "N/A", h.value ? fmt(h.value) : "N/A", fmt(h.pct) + "%"]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wavetcg-portfolio.csv"; a.click();
    showSuccess("Portfolio exported!");
  }

  function copyAddress() {
    if (!account?.address) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000008", padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <style>{`
        .token-row:hover { background: #0a1628 !important; }
        .sort-btn:hover { color: #0099ff !important; }
        .refresh-btn:hover { border-color: rgba(0,153,255,0.4) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>WaveTCG</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "32px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>Portfolio Tracker</h1>
        <p style={{ fontSize: "13px", color: "#8899bb" }}>Track your Sui ecosystem token holdings in real time.</p>
      </div>

      {!account ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>◈</div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#fff", marginBottom: "8px" }}>Connect Your Wallet</div>
          <p style={{ fontSize: "14px", color: "#8899bb" }}>Connect your Sui wallet to view your portfolio.</p>
        </div>
      ) : (
        <>
          {/* Wallet info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "8px", fontSize: "13px", color: "#0099ff", fontFamily: "monospace" }}>
              ◈ {truncate(account.address)}
            </div>
            <button onClick={copyAddress} style={{ padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#8899bb", fontSize: "12px", cursor: "pointer" }}>
              {copied ? "✅ Copied!" : "📋 Copy Address"}
            </button>
            <button onClick={fetchPortfolio} className="refresh-btn" style={{ padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#8899bb", fontSize: "12px", cursor: "pointer", marginLeft: "auto" }}>
              {loading ? "⟳ Refreshing..." : "⟳ Refresh"}
            </button>
            <button onClick={exportCSV} style={{ padding: "8px 14px", background: "transparent", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "8px", color: "#00ff88", fontSize: "12px", cursor: "pointer" }}>
              ↓ Export CSV
            </button>
          </div>

          {/* Total Value Card */}
          <div style={{ background: "linear-gradient(135deg, #050515, #0a1628)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "16px", padding: "32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top left, rgba(0,100,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8899bb", marginBottom: "8px" }}>Total Portfolio Value</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "48px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>
              {loading && holdings.length === 0 ? <span style={{ color: "#444460" }}>Loading...</span> : `$${fmt(totalValue)}`}
            </div>
            <div style={{ fontSize: "12px", color: "#444460" }}>
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Auto-refreshes every 30 seconds"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: holdings.length > 1 ? "1fr 320px" : "1fr", gap: "24px", marginBottom: "24px" }}>
            {/* Holdings Table */}
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#fff" }}>Holdings</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["value","balance","symbol"] as const).map(s => (
                    <button key={s} className="sort-btn" onClick={() => setSortBy(s)} style={{ padding: "4px 10px", background: sortBy === s ? "rgba(0,153,255,0.1)" : "transparent", border: `1px solid ${sortBy === s ? "rgba(0,153,255,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", color: sortBy === s ? "#0099ff" : "#666680", fontSize: "11px", cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
                  ))}
                </div>
              </div>

              {loading && holdings.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#444460" }}>Fetching your tokens...</div>
              ) : sorted.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#444460" }}>No tokens found in this wallet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {["Token", "Balance", "Price", "Value", "Allocation"].map(h => (
                        <th key={h} style={{ padding: "12px 24px", textAlign: h === "Token" ? "left" : "right", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#444460", fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((h, i) => (
                      <tr key={h.coinType} className="token-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: "transparent", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {h.iconUrl ? (
                              <img src={h.iconUrl} alt={h.symbol} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `${COLORS[i % COLORS.length]}22`, border: `1px solid ${COLORS[i % COLORS.length]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: COLORS[i % COLORS.length] }}>{h.symbol.slice(0, 2)}</div>
                            )}
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{h.symbol}</div>
                              <div style={{ fontSize: "11px", color: "#444460" }}>{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 24px", textAlign: "right", fontSize: "13px", color: "#c8d8f0", fontFamily: "monospace" }}>{fmt(h.balance, 4)}</td>
                        <td style={{ padding: "14px 24px", textAlign: "right", fontSize: "13px", color: h.price ? "#c8d8f0" : "#444460" }}>{h.price ? `$${fmt(h.price, 4)}` : "N/A"}</td>
                        <td style={{ padding: "14px 24px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: h.value ? "#0099ff" : "#444460" }}>{h.value ? `$${fmt(h.value)}` : "—"}</td>
                        <td style={{ padding: "14px 24px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                            <div style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${Math.min(h.pct, 100)}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: "2px" }} />
                            </div>
                            <span style={{ fontSize: "11px", color: "#8899bb", minWidth: "36px", textAlign: "right" }}>{fmt(h.pct)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pie Chart */}
            {pieData.length > 1 && (
              <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#fff", marginBottom: "20px" }}>Allocation</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `$${fmt(Number(v))}`} contentStyle={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                  {pieData.slice(0, 6).map((d, i) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#8899bb" }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#c8d8f0" }}>${fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
