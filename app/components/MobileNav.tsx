"use client";
import { useState } from "react";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/marketplace", label: "Marketplace", icon: "🃏" },
  { href: "/price-checker", label: "Prices", icon: "📈" },
  { href: "/oracle", label: "AI Oracle", icon: "🔮" },
  { href: "/optcg", label: "OPTCG", icon: "🏴\u200d☠️" },
  { href: "/deckbuilder", label: "Deck Builder", icon: "🎴" },
  { href: "/download", label: "Download", icon: "⬇️" },
  { href: "/sell", label: "Sell", icon: "💰" },
  { href: "/swap", label: "Swap", icon: "💱" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/users", label: "Traders", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5", label: "Profile", icon: "👤" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background: "rgba(0,153,255,0.1)",
        border: "1px solid rgba(0,153,255,0.3)",
        borderRadius: "8px", padding: "8px 14px",
        color: "#0099ff", fontSize: "20px", cursor: "pointer",
        lineHeight: 1,
      }}>☰</button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#000010",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(0,153,255,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#000010", flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "Cinzel, serif", fontSize: "20px", fontWeight: 900,
              background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>WaveTCG</span>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px", color: "#ffffff", fontSize: "18px",
              cursor: "pointer", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* 2-column grid links */}
          <div style={{
            padding: "16px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
            overflowY: "auto", flex: 1, background: "#000010",
          }}>
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "10px",
                color: "#c8d8f0", textDecoration: "none",
                fontSize: "13px", fontFamily: "DM Sans, sans-serif",
                background: "#0a1628",
                border: "1px solid rgba(0,153,255,0.15)",
              }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{link.icon}</span>
                <span style={{ fontWeight: 500 }}>{link.label}</span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px", background: "#000010",
            borderTop: "1px solid rgba(0,153,255,0.1)",
            fontSize: "11px", color: "#444460", textAlign: "center", flexShrink: 0,
          }}>
            🌊 WaveTCG · Web3 TCG Marketplace · Powered by Sui
          </div>
        </div>
      )}
    </>
  );
}
