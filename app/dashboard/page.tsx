"use client";
import { useState } from "react";

const tabs = ["Overview", "My Listings", "My Purchases", "My Sales", "Wallet"];
const myListings = [
  { id:1, name:"Charizard EX", game:"Pokémon", price:295, sui:40.5, status:"Active", views:142, art:"🔥", bg:"#2a0808" },
  { id:2, name:"Black Lotus", game:"Magic", price:4200, sui:577, status:"Active", views:89, art:"✨", bg:"#14082a" },
  { id:3, name:"Blue-Eyes White Dragon", game:"Yu-Gi-Oh!", price:850, sui:117, status:"Sold", views:234, art:"⚡", bg:"#080820" },
  { id:4, name:"Mewtwo V Alt Art", game:"Pokémon", price:120, sui:16.5, status:"Active", views:67, art:"🌌", bg:"#14082a" },
];
const myPurchases = [
  { id:1, name:"Mox Sapphire", game:"Magic", price:1850, sui:254, date:"Mar 28 2026", seller:"MoxBroker", art:"💎", bg:"#040e1c" },
  { id:2, name:"Pikachu Promo", game:"Pokémon", price:90, sui:12.4, date:"Mar 25 2026", seller:"TrainerRed", art:"⚡", bg:"#1a1400" },
];
const mySales = [
  { id:1, name:"Ancestral Recall", game:"Magic", price:3200, sui:439, date:"Mar 20 2026", buyer:"PowerNine", commission:32, art:"📜", bg:"#040e1c" },
  { id:2, name:"Dark Magician Ghost", game:"Yu-Gi-Oh!", price:340, sui:46.7, date:"Mar 15 2026", buyer:"DarkMage", commission:3.4, art:"🔮", bg:"#080808" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div style={{ minHeight: "100vh", background: "#000008", padding: "20px 12px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "6px" }}>My Account</div>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, background: "linear-gradient(135deg, #0030cc, #0099ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" }}>Dashboard</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0099ff", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#c8d8f0", fontFamily: "monospace" }}>0x7f3a...9b2c</span>
              <button style={{ fontSize: "11px", color: "#0099ff", background: "transparent", border: "none", cursor: "pointer" }}>Copy</button>
            </div>
          </div>
          <a href="/sell" style={{
            background: "#0099ff", color: "#000008",
            padding: "10px 20px", borderRadius: "8px",
            fontSize: "12px", fontWeight: 600,
            textDecoration: "none", display: "inline-block",
            letterSpacing: "0.05em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>+ List a Card</a>
        </div>

        {/* Stats - 2x2 grid on mobile, 4 cols on desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Total Sales", val: "$3,540", sub: "2 completed", color: "#0099ff" },
            { label: "Active Listings", val: "3", sub: "cards listed", color: "#00d4ff" },
            { label: "SUI Balance", val: "485.5", sub: "≈ $3,530", color: "#00ffcc" },
            { label: "Total Earned", val: "$3,507", sub: "after 1% fee", color: "#0099ff" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8899bb", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 600, color: s.color, marginBottom: "2px" }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: "#444460" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs - scrollable on mobile */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch" as any }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: "12px", fontWeight: 500,
              border: activeTab === tab ? "1px solid #0099ff" : "1px solid rgba(255,255,255,0.08)",
              background: activeTab === tab ? "rgba(0,153,255,0.12)" : "transparent",
              color: activeTab === tab ? "#0099ff" : "#8899bb",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Recent activity */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>Recent Activity</div>
              {[...myListings.slice(0,3)].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{item.art}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0099ff" }}>${item.price}</div>
                    <div style={{ fontSize: "10px", color: item.status === "Active" ? "#00ff88" : "#8899bb" }}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff", marginBottom: "14px" }}>Wallet</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#8899bb" }}>SUI Balance</span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#0099ff" }}>485.5 SUI</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#8899bb" }}>USD Value</span>
                <span style={{ fontSize: "14px", color: "#00ffcc" }}>≈ $3,530</span>
              </div>
            </div>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === "My Listings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myListings.map((item, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{item.art}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game} · {item.views} views</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0099ff" }}>${item.price}</div>
                  <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: item.status === "Active" ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", color: item.status === "Active" ? "#00ff88" : "#8899bb", marginTop: "2px" }}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Purchases Tab */}
        {activeTab === "My Purchases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myPurchases.map((item, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{item.art}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game} · from {item.seller}</div>
                  <div style={{ fontSize: "11px", color: "#444460" }}>{item.date}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0099ff" }}>${item.price}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.sui} SUI</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Sales Tab */}
        {activeTab === "My Sales" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {mySales.map((item, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{item.art}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game} · to {item.buyer}</div>
                  <div style={{ fontSize: "11px", color: "#444460" }}>{item.date}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#00ff88" }}>${item.price}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>fee: ${item.commission}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "Wallet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "16px", padding: "20px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff", marginBottom: "16px" }}>Sui Wallet</div>
              <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>Address</div>
                <div style={{ fontSize: "12px", color: "#0099ff", fontFamily: "monospace", wordBreak: "break-all" }}>0x7f3a...9b2c</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>SUI Balance</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#0099ff" }}>485.5</div>
                </div>
                <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>USD Value</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#00ffcc" }}>$3,530</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
