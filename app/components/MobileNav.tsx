"use client";
import { useState } from "react";

const links = [
  { href: "/marketplace", label: "Marketplace", icon: "🃏" },
  { href: "/price-checker", label: "Price Checker", icon: "📈" },
  { href: "/oracle", label: "AI Oracle", icon: "🔮" },
  { href: "/sell", label: "Sell a Card", icon: "💰" },
  { href: "/dashboard", label: "Dashboard", icon: "👤" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "6px", padding: "6px 10px",
          color: "#888898", fontSize: "18px", cursor: "pointer",
        }}>☰</button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: "280px", background: "#111118",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              padding: "24px",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <span style={{
                fontFamily: "Cinzel, serif", fontSize: "18px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #1a8fe3, #4da2ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>WaveTCG</span>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#888898", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {links.map(link => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", marginBottom: "4px",
                border: "1px solid transparent", borderRadius: "10px",
                color: "#888898", textDecoration: "none", fontSize: "14px",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#18181f";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#e6e4f0";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#888898";
                }}
              >
                <span style={{ fontSize: "20px" }}>{link.icon}</span>
                {link.label}
              </a>
            ))}

            <div style={{
              marginTop: "32px", padding: "16px",
              background: "rgba(77,162,255,0.05)",
              border: "1px solid rgba(77,162,255,0.1)",
              borderRadius: "10px", fontSize: "12px", color: "#555562",
              textAlign: "center",
            }}>
              🌊 WaveTCG · Multi-Chain TCG Marketplace
            </div>
          </div>
        </div>
      )}
    </>
  );
}
