"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GAMES = [
  { name: "One Piece TCG", icon: "🏴‍☠️", href: "/marketplace?game=onepiece", bg: "rgba(239,68,68,0.07)" },
  { name: "Pokémon TCG", icon: "⚡", href: "/marketplace?game=pokemon", bg: "rgba(234,179,8,0.07)" },
  { name: "Magic: TG", icon: "✨", href: "/marketplace?game=magic", bg: "rgba(139,92,246,0.07)" },
  { name: "Yu-Gi-Oh!", icon: "👁️", href: "/marketplace?game=yugioh", bg: "rgba(59,130,246,0.07)" },
  { name: "Dragon Ball", icon: "🐉", href: "/marketplace?game=dragonball", bg: "rgba(249,115,22,0.07)" },
  { name: "Lorcana", icon: "🌟", href: "/marketplace?game=lorcana", bg: "rgba(16,185,129,0.07)" },
  { name: "Flesh & Blood", icon: "⚔️", href: "/marketplace?game=fab", bg: "rgba(220,38,38,0.07)" },
  { name: "Digimon", icon: "🎭", href: "/marketplace?game=digimon", bg: "rgba(99,102,241,0.07)" },
];

const FEATURES = [
  { n: "01", t: "Zero Chargebacks", d: "Payment is locked in a Sui smart contract the moment a buyer purchases. Mathematically impossible to reverse. Your SUI arrives the same second." },
  { n: "02", t: "Only 1% Fee", d: "List any card for free, forever. Pay exactly 1% only when your card sells — automatically deducted on-chain. No hidden fees, no monthly costs." },
  { n: "03", t: "Instant Settlement", d: "No 7-14 day holds like TCGPlayer or eBay. SUI is in your wallet before the buyer even closes the browser. Convert to cash via our Swap page." },
  { n: "04", t: "Borderless by Default", d: "Sell to any buyer on the planet. No geographic restrictions, no currency conversion friction, no regional payment processors blocking your sales." },
  { n: "05", t: "AI Card Oracle", d: "The world's most knowledgeable TCG AI. Prices, rulings, investment tips, deck advice for every card in every TCG ever made. Powered by Claude." },
  { n: "06", t: "On-Chain Tournaments", d: "Weekly OPTCG Swiss tournaments with prize pools locked in smart contracts. Winners paid automatically. No organizer can run with the prize pool." },
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
  const [featuredListing, setFeaturedListing] = useState<any>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    // Stats
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active").then(({ count }) => setStats(s => ({ ...s, listings: count || 0 })));
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => setStats(s => ({ ...s, users: count || 0 })));
    fetch("/api/sui-price").then(r => r.json()).then(d => setSuiPrice(d.price || 0));

    // Real listings for hero
    supabase.from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFeaturedListing(data[0]);
          setRecentListings(data.slice(1, 5));
        }
      });
  }, []);

  const GAME_ICONS: Record<string, string> = {
    onepiece: "☠️", pokemon: "⚡", magic: "✨", yugioh: "👁️",
    dragonball: "🐉", lorcana: "🌟", fab: "⚔️", digimon: "🎭",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0;transform:translateY(24px) } to { opacity:1;transform:translateY(0) } }
        @keyframes ticker { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .fu { animation: fadeUp 0.7s ease forwards; opacity:0; }
        .fu1 { animation-delay:0.05s }
        .fu2 { animation-delay:0.15s }
        .fu3 { animation-delay:0.25s }
        .fu4 { animation-delay:0.35s }
        .fu5 { animation-delay:0.45s }
        .syne { font-family:'Syne',sans-serif; }
        .hb1 { background:#2563eb;color:#fff;padding:12px 24px;border-radius:9px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;transition:all 0.18s;letter-spacing:0.01em; }
        .hb1:hover { background:#1d4ed8;transform:translateY(-1px); }
        .hb2 { background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);padding:12px 20px;border-radius:9px;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;transition:all 0.18s; }
        .hb2:hover { border-color:rgba(255,255,255,0.2);color:#fff; }
        .mcard { background:#0e0e1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;cursor:pointer;transition:all 0.2s; }
        .mcard:hover { border-color:rgba(59,130,246,0.35);transform:translateY(-3px); }
        .gg { background:#0e0e1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all 0.18s;text-decoration:none; }
        .gg:hover { border-color:rgba(255,255,255,0.12);background:#13131f; }
        .fg { background:#080810;padding:32px;transition:background 0.2s; }
        .fg:hover { background:#0e0e1a; }
        .flink { display:block;font-size:13px;color:rgba(255,255,255,0.3);text-decoration:none;margin-bottom:10px;font-weight:400;transition:color 0.15s; }
        .flink:hover { color:#fff; }
        .cta-btn { background:#2563eb;color:#fff;padding:13px 28px;border-radius:9px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;transition:all 0.18s; }
        .cta-btn:hover { background:#1d4ed8;transform:translateY(-1px); }
        .cta-btn2 { background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);padding:13px 24px;border-radius:9px;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;transition:all 0.18s; }
        .cta-btn2:hover { border-color:rgba(255,255,255,0.2);color:#fff; }
      `}</style>

      {/* HERO */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 48px 0", display: "grid", gridTemplateColumns: "1fr 420px", gap: "64px", alignItems: "flex-start" }}>
        <div>
          {/* Eyebrow */}
          <div className="fu fu1" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.14em" }}>Live on Sui Mainnet</span>
            <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em" }}>Week 1 · Apr 2026</span>
          </div>

          {/* Title */}
          <h1 className="fu fu2 syne" style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, lineHeight: 1.04, color: "#fff", marginBottom: "22px", letterSpacing: "-0.02em" }}>
            The TCG Market<br />
            That Pays You{" "}
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Instantly.</span>
          </h1>

          <p className="fu fu3" style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "36px", fontWeight: 300, maxWidth: "440px" }}>
            Trade One Piece, Pokémon, Magic, and more on Sui blockchain. Free to list. 1% only when sold. Zero chargebacks. Your money in seconds.
          </p>

          <div className="fu fu4" style={{ display: "flex", gap: "10px", marginBottom: "52px", flexWrap: "wrap" }}>
            <a href="/marketplace" className="hb1">Browse Marketplace</a>
            <a href="/sell" className="hb2">+ List a Card</a>
            <a href="/optcg" className="hb2">🏴‍☠️ Tournaments</a>
          </div>

          {/* Metrics */}
          <div className="fu fu5" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
            {[
              { val: stats.listings.toLocaleString(), label: "Active Listings", sub: "Growing daily" },
              { val: "1%", label: "Platform Fee", sub: "Lowest in market" },
              { val: suiPrice > 0 ? "$" + suiPrice.toFixed(3) : "—", label: "SUI Price", sub: "Live" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#0e0e1a", padding: "20px 24px" }}>
                <div className="syne" style={{ fontSize: "26px", fontWeight: 700, color: "#fff", marginBottom: "5px", letterSpacing: "-0.01em" }}>{m.val}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 600, marginTop: "4px" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Featured Card */}
        <div style={{ paddingTop: "8px" }}>
          <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.12em", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", padding: "3px 8px", borderRadius: "5px" }}>Featured</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>One Piece TCG</span>
            </div>
            <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "72px", background: "linear-gradient(160deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06),transparent)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
              🏴‍☠️
              <div style={{ position: "absolute", top: "12px", right: "12px", fontSize: "9px", padding: "3px 8px", borderRadius: "5px", fontWeight: 700, letterSpacing: "0.1em", background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>★ SECRET RARE</div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div className="syne" style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Monkey D. Luffy</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>OP05-119 · Gear 5 · Near Mint</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="syne" style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>12.4 SUI</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>≈ ${suiPrice > 0 ? (12.4 * suiPrice).toFixed(2) : "—"} USD</div>
                </div>
                <a href="/marketplace?game=onepiece" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>Buy Now</a>
              </div>
            </div>
          </div>

          {/* Mini cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { icon: "⚡", name: "Charizard ex", set: "SV3 · Pokémon", price: "45 SUI", badge: "SR", bc: "rgba(59,130,246,0.15)", bt: "#60a5fa", href: "/marketplace?game=pokemon" },
              { icon: "✨", name: "Black Lotus", set: "Alpha · Magic", price: "320 SUI", badge: "P9", bc: "rgba(139,92,246,0.15)", bt: "#a78bfa", href: "/marketplace?game=magic" },
              { icon: "👁️", name: "Blue-Eyes Dragon", set: "LOB · Yu-Gi-Oh", price: "6.8 SUI", badge: "UR", bc: "rgba(16,185,129,0.15)", bt: "#34d399", href: "/marketplace?game=yugioh" },
              { icon: "☠️", name: "Roronoa Zoro", set: "OP01 · One Piece", price: "8.2 SUI", badge: "SR", bc: "rgba(59,130,246,0.15)", bt: "#60a5fa", href: "/marketplace?game=onepiece" },
            ].map((c, i) => (
              <a key={i} href={c.href} style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", cursor: "pointer", textDecoration: "none", transition: "all 0.18s", display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>{c.icon}</span>
                  <span style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.08em", background: c.bc, color: c.bt, border: `1px solid ${c.bc}` }}>{c.badge}</span>
                </div>
                <div className="syne" style={{ fontSize: "12px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{c.name}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>{c.set}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6" }}>{c.price}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0e0e1a", padding: "12px 0", marginTop: "72px", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "max-content" }}>
          {[...TICKER_CARDS, ...TICKER_CARDS].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "24px", padding: "0 40px", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{t.game}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{t.price}</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981" }}>{t.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOT CARDS */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 48px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "8px" }}>🔥 Trending</div>
            <div className="syne" style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Hot Cards This Week</div>
          </div>
          <a href="/marketplace" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>View all listings →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px" }}>
          {[
            { icon: "☠️", name: "Monkey D. Luffy", game: "One Piece TCG", price: "12.4 SUI", r: "SEC", rc: "rgba(245,158,11,0.12)", rt: "#f59e0b", bg: "linear-gradient(160deg,#1a0a28,#080810)", href: "/marketplace?game=onepiece" },
            { icon: "⚡", name: "Charizard ex", game: "Pokémon TCG", price: "45.0 SUI", r: "SR", rc: "rgba(59,130,246,0.12)", rt: "#60a5fa", bg: "linear-gradient(160deg,#1a1008,#080810)", href: "/marketplace?game=pokemon" },
            { icon: "✨", name: "Black Lotus", game: "Magic: TG", price: "320 SUI", r: "P9", rc: "rgba(139,92,246,0.12)", rt: "#a78bfa", bg: "linear-gradient(160deg,#0a0818,#080810)", href: "/marketplace?game=magic" },
            { icon: "☠️", name: "Roronoa Zoro", game: "One Piece TCG", price: "8.2 SUI", r: "SR", rc: "rgba(59,130,246,0.12)", rt: "#60a5fa", bg: "linear-gradient(160deg,#081808,#080810)", href: "/marketplace?game=onepiece" },
            { icon: "👁️", name: "Blue-Eyes Dragon", game: "Yu-Gi-Oh!", price: "6.8 SUI", r: "UR", rc: "rgba(16,185,129,0.12)", rt: "#34d399", bg: "linear-gradient(160deg,#080f18,#080810)", href: "/marketplace?game=yugioh" },
          ].map((c, i) => (
            <a key={i} href={c.href} className="mcard" style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", paddingBottom: "140%" }}>
                <div style={{ position: "absolute", inset: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>{c.icon}</div>
                <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "8px", padding: "2px 7px", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.08em", background: c.rc, color: c.rt, border: `1px solid ${c.rc}` }}>{c.r}</div>
              </div>
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontWeight: 600 }}>{c.game}</div>
                <div className="syne" style={{ fontSize: "12px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "10px" }}>{c.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#3b82f6" }}>{c.price}</span>
                  <span style={{ fontSize: "9px", padding: "4px 9px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "5px", color: "#3b82f6", fontWeight: 700, letterSpacing: "0.04em" }}>BUY</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* GAMES */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 48px 0" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "8px" }}>All Games</div>
          <div className="syne" style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Trade Any TCG</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {GAMES.map((g, i) => (
            <a key={i} href={g.href} className="gg">
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, background: g.bg }}>{g.icon}</div>
              <div>
                <div className="syne" style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{g.name}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Browse listings</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "18px", color: "rgba(255,255,255,0.2)" }}>›</span>
            </a>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: "#0e0e1a", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "72px 48px", marginTop: "72px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "8px" }}>Why WaveTCG</div>
            <div className="syne" style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Infrastructure that works for sellers</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="fg">
                <div className="syne" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "24px" }}>{f.n}</div>
                <div className="syne" style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>{f.t}</div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "96px 48px", textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
        <h2 className="syne" style={{ fontSize: "clamp(32px,5vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: "18px", letterSpacing: "-0.02em" }}>Start trading in 30 seconds.</h2>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: "36px", fontWeight: 300 }}>Connect your Sui wallet, list your first card for free, and get paid instantly when it sells. No approval needed.</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/marketplace" className="cta-btn">Browse Marketplace</a>
          <a href="/sell" className="cta-btn2">List a Card Free</a>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#0e0e1a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "56px 48px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "80px", marginBottom: "48px" }}>
            <div>
              <div className="syne" style={{ fontSize: "17px", fontWeight: 800, color: "#fff", marginBottom: "14px", letterSpacing: "0.03em" }}>WAVE<span style={{ color: "#2563eb" }}>.</span>TCG</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.75, fontWeight: 300, maxWidth: "180px" }}>The Web3 TCG Marketplace built on Sui blockchain. Trade any card, any game, worldwide.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px" }}>
              {[
                { title: "Market", links: [{ l: "Browse Cards", h: "/marketplace" }, { l: "List a Card", h: "/sell" }, { l: "Price Checker", h: "/price-checker" }, { l: "Alerts", h: "/alerts" }] },
                { title: "Features", links: [{ l: "AI Oracle", h: "/oracle" }, { l: "Tournaments", h: "/optcg" }, { l: "Deck Builder", h: "/deckbuilder" }, { l: "Portfolio", h: "/portfolio" }] },
                { title: "Account", links: [{ l: "Dashboard", h: "/dashboard" }, { l: "Orders", h: "/orders" }, { l: "Profile", h: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5" }, { l: "Swap", h: "/swap" }] },
                { title: "Help", links: [{ l: "Guide", h: "/guide" }, { l: "FAQ", h: "/guide?tab=faq" }, { l: "Twitter", h: "https://twitter.com/wavetcg" }, { l: "Collectors", h: "/users" }] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "16px" }}>{col.title}</div>
                  {col.links.map((lk, j) => (
                    <a key={j} href={lk.h} className="flink">{lk.l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
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
