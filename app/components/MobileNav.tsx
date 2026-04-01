"use client";
import { useState } from "react";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/marketplace", label: "Marketplace", icon: "🃏" },
  { href: "/price-checker", label: "Prices", icon: "📈" },
  { href: "/oracle", label: "AI Oracle", icon: "🔮" },
  { href: "/optcg", label: "OPTCG Hub", icon: "🏴‍☠️" },
  { href: "/deckbuilder", label: "Deck Builder", icon: "🎴" },
  { href: "/download", label: "Download", icon: "⬇️" },
  { href: "/sell", label: "Sell a Card", icon: "💰" },
  { href: "/swap", label: "Swap Tokens", icon: "💱" },
  { href: "/alerts", label: "Price Alerts", icon: "🔔" },
  { href: "/users", label: "Traders", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5", label: "My Profile", icon: "👤" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        background: "transparent", border: "1px solid rgba(0,153,255,0.3)",
        borderRadius: "8px", padding: "7px 12px",
        color: "#0099ff", fontSize: "18px", cursor: "pointer",
      }}>☰</button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: "300px", background: "#000010",
            borderLeft: "1px solid rgba(0,153,255,0.3)",
            padding: "0", display: "flex", flexDirection: "column",
            overflowY: "auto",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.9)",
          }}>
            {/* Header */}
            <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(0,153,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "20px", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WaveTCG</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#c8d8f0", fontSize: "16px", cursor: "pointer", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Links */}
            <div style={{ padding: "12px", flex: 1 }}>
              {links.map((link, i) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "13px 16px", marginBottom: "4px",
                  borderRadius: "10px", color: "#c8d8f0",
                  textDecoration: "none", fontSize: "14px", fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.15s", border: "1px solid transparent",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#0a1628"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#c8d8f0"; }}>
                  <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(0,153,255,0.1)", fontSize: "11px", color: "#444460", textAlign: "center" }}>
              🌊 WaveTCG · Web3 TCG Marketplace · Powered by Sui
            </div>
          </div>
        </div>
      )}
    </>
  );
}
