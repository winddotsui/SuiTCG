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
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "40px 48px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "8px" }}>My Account</div>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "36px", fontWeight: 700, color: "#e6e4f0", marginBottom: "8px" }}>Dashboard</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4da2ff" }} />
              <span style={{ fontSize: "13px", color: "#888898", fontFamily: "monospace" }}>0x7f3a...9b2c</span>
              <button style={{ fontSize: "11px", color: "#4da2ff", background: "transparent", border: "none", cursor: "pointer" }}>Copy</button>
            </div>
          </div>
          <a href="/sell" style={{
            background: "#c9a84c", color: "#0a0a0f",
            padding: "12px 24px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500,
            textDecoration: "none", display: "inline-block",
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>+ List a Card</a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total Sales", val: "$3,540", sub: "2 completed" },
            { label: "Active Listings", val: "3", sub: "cards listed" },
            { label: "SUI Balance", val: "485.5", sub: "≈ $3,530" },
            { label: "Total Earned", val: "$3,507", sub: "after 1% fee" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#555562", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 600, color: "#e8c97a", marginBottom: "4px" }}>{s.val}</div>
              <div style={{ fontSize: "12px", color: "#888898" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "32px" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 20px", background: "transparent",
              border: "none", borderBottom: activeTab === tab ? "2px solid #c9a84c" : "2px solid transparent",
              color: activeTab === tab ? "#e8c97a" : "#888898",
              fontSize: "13px", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.04em",
              marginBottom: "-1px",
            }}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "20px" }}>Recent Activity</div>
              {[
                { action: "Card Sold", card: "Ancestral Recall", amount: "+$3,200", color: "#4caf7d", date: "Mar 20" },
                { action: "Card Sold", card: "Dark Magician Ghost", amount: "+$340", color: "#4caf7d", date: "Mar 15" },
                { action: "Purchased", card: "Mox Sapphire", amount: "-$1,850", color: "#e05555", date: "Mar 28" },
                { action: "Listed", card: "Charizard EX", amount: "$295", color: "#888898", date: "Mar 29" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#e6e4f0" }}>{a.action} — {a.card}</div>
                    <div style={{ fontSize: "11px", color: "#555562" }}>{a.date}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: a.color }}>{a.amount}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "20px" }}>Wallet</div>
              <div style={{ background: "#18181f", border: "1px solid rgba(77,162,255,0.2)", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#4da2ff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>SUI Balance</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "36px", fontWeight: 600, color: "#78bfff" }}>485.5 SUI</div>
                <div style={{ fontSize: "13px", color: "#888898" }}>≈ $3,530 USD</div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={{ flex: 1, background: "rgba(77,162,255,0.1)", color: "#78bfff", border: "1px solid rgba(77,162,255,0.3)", borderRadius: "8px", padding: "12px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Deposit</button>
                <button style={{ flex: 1, background: "transparent", color: "#888898", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Withdraw</button>
              </div>
            </div>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === "My Listings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myListings.map(card => (
              <div key={card.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", transition: "border-color 0.2s" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>{card.art}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#e6e4f0", marginBottom: "4px" }}>{card.name}</div>
                  <div style={{ fontSize: "12px", color: "#555562", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.game} · {card.views} views</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 500, color: "#e8c97a" }}>${card.price.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "#4da2ff" }}>{card.sui} SUI</div>
                </div>
                <div style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: card.status === "Active" ? "rgba(76,175,61,0.1)" : "rgba(201,168,76,0.1)", color: card.status === "Active" ? "#4caf7d" : "#e8c97a", border: card.status === "Active" ? "1px solid rgba(76,175,61,0.2)" : "1px solid rgba(201,168,76,0.2)" }}>{card.status}</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#888898", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Edit</button>
                  <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(224,85,85,0.3)", borderRadius: "6px", color: "#e05555", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Purchases Tab */}
        {activeTab === "My Purchases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myPurchases.map(card => (
              <div key={card.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>{card.art}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#e6e4f0", marginBottom: "4px" }}>{card.name}</div>
                  <div style={{ fontSize: "12px", color: "#555562" }}>{card.game} · Seller: {card.seller} · {card.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 500, color: "#e05555" }}>-${card.price.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "#4da2ff" }}>{card.sui} SUI</div>
                </div>
                <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#888898", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>View</button>
              </div>
            ))}
          </div>
        )}

        {/* My Sales Tab */}
        {activeTab === "My Sales" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mySales.map(card => (
              <div key={card.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>{card.art}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#e6e4f0", marginBottom: "4px" }}>{card.name}</div>
                  <div style={{ fontSize: "12px", color: "#555562" }}>{card.game} · Buyer: {card.buyer} · {card.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 500, color: "#4caf7d" }}>+${card.price.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "#e05555" }}>-${card.commission} fee</div>
                </div>
                <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "#888898", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Receipt</button>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "Wallet" && (
          <div style={{ maxWidth: "600px" }}>
            <div style={{ background: "#111118", border: "1px solid rgba(77,162,255,0.2)", borderRadius: "16px", padding: "32px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#4da2ff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Connected Wallet</div>
              <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#e6e4f0", marginBottom: "20px", padding: "12px", background: "#18181f", borderRadius: "8px" }}>0x7f3a8b2c9d4e1f6a...9b2c</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "48px", fontWeight: 600, color: "#78bfff", marginBottom: "4px" }}>485.5</div>
              <div style={{ fontSize: "16px", color: "#4da2ff", marginBottom: "4px" }}>SUI</div>
              <div style={{ fontSize: "14px", color: "#888898", marginBottom: "32px" }}>≈ $3,530 USD</div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ flex: 1, background: "rgba(77,162,255,0.1)", color: "#78bfff", border: "1px solid rgba(77,162,255,0.3)", borderRadius: "8px", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>◈ Deposit SUI</button>
                <button style={{ flex: 1, background: "transparent", color: "#888898", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Withdraw</button>
              </div>
            </div>

            <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "16px" }}>Transaction History</div>
              {[
                { type: "Received", desc: "Sale — Ancestral Recall", amount: "+439 SUI", color: "#4caf7d", date: "Mar 20" },
                { type: "Received", desc: "Sale — Dark Magician Ghost", amount: "+46.7 SUI", color: "#4caf7d", date: "Mar 15" },
                { type: "Sent", desc: "Purchase — Mox Sapphire", amount: "-254 SUI", color: "#e05555", date: "Mar 28" },
                { type: "Fee", desc: "Platform fee — Ancestral Recall", amount: "-4.39 SUI", color: "#e05555", date: "Mar 20" },
              ].map((tx, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#e6e4f0" }}>{tx.desc}</div>
                    <div style={{ fontSize: "11px", color: "#555562" }}>{tx.type} · {tx.date}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: tx.color }}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
