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
        background: "rgba(0,153,255,0.15)",
        border: "1px solid rgba(0,153,255,0.4)",
        borderRadius: "8px", padding: "8px 14px",
        color: "#0099ff", fontSize: "20px", cursor: "pointer",
        lineHeight: 1,
      }}>☰</button>

      {open && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 999999,
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 16px",
            borderBottom: "2px solid rgba(0,153,255,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#000010",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "Cinzel, serif",
              fontSize: "20px",
              fontWeight: 900,
              background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>WaveTCG</span>
            <button onClick={() => setOpen(false)} style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "20px",
              cursor: "pointer",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>✕</button>
          </div>

          {/* 2 column grid */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#000010",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            alignContent: "start",
          }}>
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 12px",
                borderRadius: "10px",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
                backgroundColor: "#0a1628",
                border: "1px solid rgba(0,153,255,0.2)",
              }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>


        </div>
      )}
    </>
  );
}
