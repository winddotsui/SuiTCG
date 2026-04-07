"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GAMES = [
  { name: "One Piece TCG", icon: "☠️", href: "/marketplace?game=onepiece", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
  { name: "Pokémon TCG", icon: "⚡", href: "/marketplace?game=pokemon", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.15)" },
  { name: "Magic: TG", icon: "✨", href: "/marketplace?game=magic", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
  { name: "Yu-Gi-Oh!", icon: "👁️", href: "/marketplace?game=yugioh", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
  { name: "Dragon Ball", icon: "🐉", href: "/marketplace?game=dragonball", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.15)" },
  { name: "Lorcana", icon: "🌟", href: "/marketplace?game=lorcana", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
  { name: "Flesh & Blood", icon: "⚔️", href: "/marketplace?game=fab", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.15)" },
  { name: "Digimon", icon: "🎭", href: "/marketplace?game=digimon", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)" },
];

const FEATURES = [
  { n: "01", t: "Zero Chargebacks", d: "Payment locked in a Sui smart contract. Mathematically impossible to reverse. Your SUI arrives the same second the buyer pays." },
  { n: "02", t: "Only 1% Fee", d: "List for free forever. Pay exactly 1% only when your card sells — auto-deducted on-chain. No hidden fees, no monthly costs." },
  { n: "03", t: "Instant Settlement", d: "No 7-14 day holds. SUI is in your wallet the moment the buyer pays. Convert to cash via our Swap page anytime." },
  { n: "04", t: "Borderless by Default", d: "Sell to any buyer on the planet. No geographic restrictions, no currency friction, no regional payment blocks." },
  { n: "05", t: "AI Card Oracle", d: "The world's most knowledgeable TCG AI. Prices, rulings, deck advice for every card in every TCG ever made." },
  { n: "06", t: "On-Chain Tournaments", d: "Weekly OPTCG Swiss tournaments. Prize pools locked in smart contracts, paid automatically to winners." },
];

const TICKER_CARDS = [
  { game: "One Piece", name: "Monkey D. Luffy SEC", price: "12.4 SUI", change: "+8.2%" },
  { game: "Pokémon", name: "Charizard ex SV3", price: "45.0 SUI", change: "+3.1%" },
  { game: "Magic", name: "Black Lotus Alpha", price: "320 SUI", change: "+1.4%" },
  { game: "Yu-Gi-Oh", name: "Blue-Eyes White Dragon", price: "6.8 SUI", change: "+12%" },
  { game: "One Piece", name: "Shanks OP06-001", price: "18.5 SUI", change: "+6.4%" },
  { game: "Pokémon", name: "Pikachu Illustrator", price: "890 SUI", change: "+0.8%" },
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
    <div style={{ minHeight: "100vh", background: "#080810" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0;transform:translateY(20px) } to { opacity:1;transform:translateY(0) } }
        @keyframes ticker { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
        .fu { animation: fadeUp 0.65s ease forwards; opacity:0; }
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.15s}.fu3{animation-delay:0.25s}.fu4{animation-delay:0.35s}.fu5{animation-delay:0.45s}
        .syne { font-family:'Syne',sans-serif; }
        .hb1 { background:#2563eb;color:#fff;padding:13px 28px;border-radius:9px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;transition:all 0.18s; }
        .hb1:hover { background:#1d4ed8;transform:translateY(-1px); }
        .hb2 { background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.65);padding:13px 22px;border-radius:9px;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;transition:all 0.18s; }
        .hb2:hover { border-color:rgba(255,255,255,0.2);color:#fff; }
        .game-card { background:#0e0e1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all 0.18s;text-decoration:none; }
        .game-card:hover { border-color:rgba(255,255,255,0.14);background:#13131f;transform:translateY(-1px); }
        .feat-card { background:#080810;padding:32px;transition:background 0.2s; }
        .feat-card:hover { background:#0e0e1a; }
        .flink { display:block;font-size:13px;color:rgba(255,255,255,0.3);text-decoration:none;margin-bottom:10px;font-weight:400;transition:color 0.15s; }
        .flink:hover { color:#fff; }
        .stat-box { background:#0e0e1a;padding:24px 32px;border-right:1px solid rgba(255,255,255,0.06); }
        .stat-box:last-child { border-right:none; }
      `}</style>

      {/* HERO */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 48px 0", textAlign: "center" }}>
        {/* Live badge */}
        <div className="fu fu1" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "blink 2s infinite" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.14em" }}>Live on Sui Mainnet</span>
          <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)", display: "inline-block" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em" }}>Week 1 · Apr 2026</span>
        </div>

        {/* Title */}
        <h1 className="fu fu2 syne" style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 800, lineHeight: 1.04, color: "#fff", marginBottom: "24px", letterSpacing: "-0.025em" }}>
          The TCG Marketplace<br />
          That Pays You{" "}
          <span style={{ color: "rgba(255,255,255,0.2)" }}>Instantly.</span>
        </h1>

        {/* Subtitle */}
        <p className="fu fu3" style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: "40px", fontWeight: 300, maxWidth: "560px", margin: "0 auto 40px" }}>
          Trade One Piece, Pokémon, Magic, Yu-Gi-Oh! and more on Sui blockchain.<br />
          Free to list. 1% only when sold. Zero chargebacks. Money in seconds.
        </p>

        {/* CTAs */}
        <div className="fu fu4" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px" }}>
          <a href="/marketplace" className="hb1">Browse Marketplace</a>
          <a href="/sell" className="hb2">+ List a Card</a>
          <a href="/optcg" className="hb2">☠️ Tournaments</a>
          <a href="/oracle" className="hb2">🤖 AI Oracle</a>
        </div>

        {/* Stats bar */}
        <div className="fu fu5" style={{ display: "inline-flex", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden", background: "#0e0e1a" }}>
          {[
            { val: stats.listings > 0 ? stats.listings.toLocaleString() : "0", label: "Active Listings" },
            { val: stats.users > 0 ? stats.users.toLocaleString() : "0", label: "Collectors" },
            { val: "1%", label: "Platform Fee" },
            { val: suiPrice > 0 ? "$" + suiPrice.toFixed(3) : "—", label: "SUI Price" },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <div className="syne" style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0e0e1a", padding: "13px 0", marginTop: "80px", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 32s linear infinite", width: "max-content" }}>
          {[...TICKER_CARDS, ...TICKER_CARDS].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "0 40px", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{t.game}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{t.price}</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981" }}>{t.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GAMES */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 48px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "10px" }}>Supported Games</div>
          <div className="syne" style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Trade Any TCG</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {GAMES.map((g, i) => (
            <a key={i} href={g.href} className="game-card">
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, background: g.bg, border: `1px solid ${g.border}` }}>{g.icon}</div>
              <div>
                <div className="syne" style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{g.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Browse listings ›</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* WHY WAVETCG */}
      <div style={{ background: "#0d0d18", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "80px 48px", marginTop: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "10px" }}>Why WaveTCG</div>
            <div className="syne" style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Infrastructure built for sellers</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card">
                <div className="syne" style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>{f.n}</div>
                <div className="syne" style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>{f.t}</div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ padding: "100px 48px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div className="syne" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "18px", letterSpacing: "-0.02em" }}>
          Start trading in<br />30 seconds.
        </div>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: "36px", fontWeight: 300 }}>
          Connect your Sui wallet, list your first card for free, and get paid instantly when it sells. No approval needed.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/marketplace" className="hb1">Browse Marketplace</a>
          <a href="/sell" className="hb2">List a Card Free</a>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#0d0d18", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 48px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "80px", marginBottom: "48px" }}>
            <div>
              <div className="syne" style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "0.04em" }}>WAVE<span style={{ color: "#2563eb" }}>.</span>TCG</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", lineHeight: 1.75, fontWeight: 300 }}>The Web3 TCG Marketplace built on Sui blockchain.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
              {[
                { title: "Market", links: [{ l: "Browse Cards", h: "/marketplace" }, { l: "List a Card", h: "/sell" }, { l: "Price Checker", h: "/price-checker" }, { l: "Alerts", h: "/alerts" }] },
                { title: "Features", links: [{ l: "AI Oracle", h: "/oracle" }, { l: "Tournaments", h: "/optcg" }, { l: "Deck Builder", h: "/deckbuilder" }, { l: "Portfolio", h: "/portfolio" }] },
                { title: "Account", links: [{ l: "Dashboard", h: "/dashboard" }, { l: "Orders", h: "/orders" }, { l: "Profile", h: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5" }, { l: "Swap", h: "/swap" }] },
                { title: "Help", links: [{ l: "Guide", h: "/guide" }, { l: "FAQ", h: "/guide?tab=faq" }, { l: "Collectors", h: "/users" }, { l: "Analytics", h: "/analytics" }] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "14px" }}>{col.title}</div>
                  {col.links.map((lk, j) => <a key={j} href={lk.h} className="flink">{lk.l}</a>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>© 2026 WaveTCG · Built on Sui Blockchain</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {["1% fee", "Free listings", "Instant pay", "On-chain"].map((t, i) => (
                <span key={i} style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", color: "rgba(255,255,255,0.2)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
