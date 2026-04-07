"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GAMES = [
  { name: "One Piece TCG", icon: "🏴‍☠️", href: "/marketplace?game=onepiece", color: "#fff7ed", border: "#fed7aa" },
  { name: "Pokémon TCG", icon: "⚡", href: "/marketplace?game=pokemon", color: "#fefce8", border: "#fde68a" },
  { name: "Magic: TG", icon: "✨", href: "/marketplace?game=magic", color: "#f5f3ff", border: "#ddd6fe" },
  { name: "Yu-Gi-Oh!", icon: "👁️", href: "/marketplace?game=yugioh", color: "#fff1f2", border: "#fecdd3" },
  { name: "Dragon Ball", icon: "🐉", href: "/marketplace?game=dragonball", color: "#fff7ed", border: "#fed7aa" },
  { name: "Lorcana", icon: "🌟", href: "/marketplace?game=lorcana", color: "#f0fdf4", border: "#bbf7d0" },
  { name: "Flesh & Blood", icon: "⚔️", href: "/marketplace?game=fab", color: "#fff1f2", border: "#fecdd3" },
  { name: "Digimon", icon: "🎭", href: "/marketplace?game=digimon", color: "#eff6ff", border: "#bfdbfe" },
];

const FEATURES = [
  { icon: "🔒", title: "Zero Chargebacks", desc: "Payment locked on Sui blockchain. Buyers can't dispute or reverse. Your SUI arrives instantly." },
  { icon: "💸", title: "Only 1% Fee", desc: "List for free. Pay 1% only when your card sells — automatically deducted on-chain." },
  { icon: "⚡", title: "Instant Settlement", desc: "No waiting 7-14 days like TCGPlayer. SUI hits your wallet the second the buyer pays." },
  { icon: "🌍", title: "Global & Borderless", desc: "Sell to buyers worldwide. No geographic restrictions, no currency conversion hassle." },
  { icon: "🤖", title: "AI Card Oracle", desc: "Ask anything — prices, rulings, deck advice, investment tips — for any TCG ever made." },
  { icon: "🏆", title: "Weekly Tournaments", desc: "Compete in One Piece TCG tournaments. Prize pool paid automatically via smart contract." },
];

export default function Home() {
  const [stats, setStats] = useState({ listings: 0, users: 0 });
  const [suiPrice, setSuiPrice] = useState(0);

  useEffect(() => {
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active").then(({ count }) => setStats(s => ({ ...s, listings: count || 0 })));
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => setStats(s => ({ ...s, users: count || 0 })));
    fetch("/api/sui-price").then(r => r.json()).then(d => setSuiPrice(d.price || 0));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .game-pill:hover { border-color: #d1d5db !important; background: #fff !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .feature-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
        .cta-primary:hover { background: #1f2937 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important; }
        .cta-secondary:hover { background: #f9fafb !important; }
        .stat-card:hover { border-color: #d1d5db !important; }
        * { transition-property: transform, box-shadow, border-color, background; transition-duration: 0.2s; }
      `}</style>

      {/* Hero */}
      <section style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "80px 24px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "6px 14px", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>Live on Sui Mainnet</span>
          </div>

          <h1 className="fade-up" style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, color: "#111827", lineHeight: 1.1, marginBottom: "20px", animationDelay: "0.1s" }}>
            The TCG Marketplace<br />
            <span style={{ color: "#3b82f6" }}>Built for Collectors</span>
          </h1>

          <p className="fade-up" style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#6b7280", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto 40px", animationDelay: "0.2s" }}>
            Buy and sell One Piece, Pokémon, Magic, Yu-Gi-Oh! and more on Sui blockchain. Free listings. 1% fee. Instant payment.
          </p>

          <div className="fade-up" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px", animationDelay: "0.3s" }}>
            <a href="/marketplace" className="cta-primary" style={{ background: "#111827", color: "#fff", padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>Browse Cards</a>
            <a href="/sell" className="cta-secondary" style={{ background: "#fff", color: "#374151", padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none", display: "inline-block", border: "1px solid #e5e7eb" }}>+ List a Card</a>
            <a href="/optcg" style={{ background: "#fff", color: "#374151", padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 500, textDecoration: "none", display: "inline-block", border: "1px solid #e5e7eb" }}>🏴‍☠️ Tournaments</a>
          </div>

          {/* Stats */}
          <div className="fade-up" style={{ display: "flex", gap: "0", justifyContent: "center", animationDelay: "0.4s" }}>
            {[
              { num: stats.listings > 0 ? stats.listings.toLocaleString() : "0", label: "Active Listings" },
              { num: stats.users > 0 ? stats.users.toLocaleString() : "0", label: "Collectors" },
              { num: "1%", label: "Platform Fee" },
              { num: suiPrice > 0 ? "$" + suiPrice.toFixed(3) : "—", label: "SUI Price" },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ padding: "20px 40px", borderRight: i < 3 ? "1px solid #f3f4f6" : "none", textAlign: "center", border: "1px solid #f3f4f6", borderRadius: i === 0 ? "12px 0 0 12px" : i === 3 ? "0 12px 12px 0" : "0", borderLeft: i === 0 ? "1px solid #f3f4f6" : "none", background: "#fff" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{s.num}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section style={{ padding: "64px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "8px" }}>Supported Games</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, color: "#111827" }}>Trade Any TCG</h2>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {GAMES.map((g, i) => (
            <a key={i} href={g.href} className="game-pill" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: g.color, border: `1px solid ${g.border}`, borderRadius: "40px", textDecoration: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "18px" }}>{g.icon}</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{g.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Why WaveTCG */}
      <section style={{ background: "#fff", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", padding: "64px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "8px" }}>Why WaveTCG</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, color: "#111827" }}>No More Chargebacks. No More Waiting.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "14px", padding: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>{f.title}</div>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#111827", marginBottom: "16px" }}>Ready to start trading?</h2>
        <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "32px", lineHeight: 1.7 }}>Join collectors already trading on WaveTCG. List your first card for free today.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/marketplace" className="cta-primary" style={{ background: "#111827", color: "#fff", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>Browse Marketplace</a>
          <a href="/sell" className="cta-secondary" style={{ background: "#fff", color: "#374151", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid #e5e7eb" }}>List a Card</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827", padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>WaveTCG</div>
              <p style={{ fontSize: "14px", color: "#9ca3af", maxWidth: "240px", lineHeight: 1.6 }}>The Web3 TCG Marketplace built on Sui blockchain.</p>
            </div>
            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              {[
                { title: "Marketplace", links: [{ label: "Browse Cards", href: "/marketplace" }, { label: "List a Card", href: "/sell" }, { label: "Price Checker", href: "/price-checker" }] },
                { title: "Features", links: [{ label: "AI Oracle", href: "/oracle" }, { label: "Tournaments", href: "/optcg" }, { label: "Deck Builder", href: "/deckbuilder" }] },
                { title: "Account", links: [{ label: "Dashboard", href: "/dashboard" }, { label: "Orders", href: "/orders" }, { label: "Portfolio", href: "/portfolio" }] },
                { title: "Help", links: [{ label: "Guide", href: "/guide" }, { label: "FAQ", href: "/guide?tab=faq" }] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{col.title}</div>
                  {col.links.map((l, j) => (
                    <a key={j} href={l.href} style={{ display: "block", fontSize: "14px", color: "#9ca3af", textDecoration: "none", marginBottom: "8px", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                    >{l.label}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1f2937", paddingTop: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>© 2026 WaveTCG. Built on Sui blockchain.</div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>1% platform fee · Free to list · Instant settlement</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
