"use client";
import dynamic from "next/dynamic";
const FloatingCharacters = dynamic(() => import("./components/FloatingCharacters"), { ssr: false });
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const OPTCG_FLAGSHIP = [
  { code: "OP01-001", name: "Roronoa Zoro" },
  { code: "OP01-003", name: "Monkey D. Luffy" },
  { code: "OP01-031", name: "Kouzuki Oden" },
  { code: "OP01-060", name: "Donquixote Doflamingo" },
  { code: "OP02-001", name: "Edward Newgate" },
  { code: "OP03-001", name: "Monkey D. Luffy" },
];

const FEATURES = [
  { icon: "🃏", title: "Free Listings", desc: "List any card for free. Only 1% when it sells — paid on-chain automatically." },
  { icon: "⛓️", title: "Sui Blockchain", desc: "Trade on Sui — fast, cheap, secure. Use any Sui wallet." },
  { icon: "🤖", title: "AI Oracle", desc: "Ask anything about any TCG card. Prices, rulings, market trends, deck advice." },
  { icon: "🏴‍☠️", title: "OPTCG Tournaments", desc: "Compete in weekly One Piece TCG tournaments. Win SUI prizes on-chain." },
  { icon: "📈", title: "Price Checker", desc: "Compare prices across TCGPlayer, CardKingdom, and WaveTCG in one place." },
  { icon: "🎴", title: "Deck Builder", desc: "Build and save your OPTCG decks. Register directly for tournaments." },
];

const GAMES = [
  { icon: "🏴‍☠️", name: "One Piece TCG", href: "/marketplace?game=onepiece" },
  { icon: "⚡", name: "Pokémon TCG", href: "/marketplace?game=pokemon" },
  { icon: "✨", name: "Magic: The Gathering", href: "/marketplace?game=magic" },
  { icon: "👁️", name: "Yu-Gi-Oh!", href: "/marketplace?game=yugioh" },
  { icon: "🐉", name: "Dragon Ball", href: "/marketplace?game=dragonball" },
  { icon: "🌟", name: "Lorcana", href: "/marketplace?game=lorcana" },
  { icon: "⚔️", name: "Flesh & Blood", href: "/marketplace?game=fab" },
  { icon: "🎭", name: "Digimon", href: "/marketplace?game=digimon" },
];

const HOT_CARDS = [
  { code: "OP05-119", name: "Monkey D. Luffy", info: "Gear 5 · SEC", price: "$380", game: "One Piece TCG" },
  { code: "OP02-013", name: "Monkey D. Luffy", info: "Purple · SEC", price: "$290", game: "One Piece TCG" },
  { code: "OP01-025", name: "Roronoa Zoro", info: "SR Red", price: "$120", game: "One Piece TCG" },
  { code: "OP06-001", name: "Shanks", info: "Leader OP06", price: "$75", game: "One Piece TCG" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [floatingCards, setFloatingCards] = useState<any[]>([]);
  const [stats, setStats] = useState({ listings: 0, users: 0, alerts: 0 });
  const [hotCards, setHotCards] = useState<any[]>([]);
  const [pkCards, setPkCards] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const positions = [
      { x: "2%", y: "18%", size: 130, delay: 0, rotate: -8 },
      { x: "80%", y: "12%", size: 120, delay: 0.5, rotate: 6 },
      { x: "88%", y: "52%", size: 115, delay: 1, rotate: -4 },
      { x: "0%", y: "62%", size: 120, delay: 1.5, rotate: 5 },
      { x: "76%", y: "75%", size: 110, delay: 0.8, rotate: -6 },
      { x: "5%", y: "80%", size: 115, delay: 1.2, rotate: 4 },
    ];
    setFloatingCards(OPTCG_FLAGSHIP.map((card, i) => ({
      ...card, ...positions[i],
      imageUrl: `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`,
    })));
    fetchStats();
    fetchHotCards();
  }, []);

  async function fetchStats() {
    try {
      const [listingsRes, usersRes, alertsRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("price_alerts").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats({
        listings: listingsRes.count || 0,
        users: usersRes.count || 0,
        alerts: alertsRes.count || 0,
      });
    } catch {}
  }

  async function fetchHotCards() {
    try {
      const pkRes = await fetch("https://api.pokemontcg.io/v2/cards?q=name:charizard&pageSize=4&orderBy=-cardmarket.prices.averageSellPrice");
      const pkData = await pkRes.json();
      if (pkData.data) setPkCards(pkData.data.slice(0, 4).map((c: any) => ({
        name: c.name,
        image: c.images?.large,
        info: c.set?.name,
        price: c.cardmarket?.prices?.averageSellPrice ? `$${c.cardmarket.prices.averageSellPrice.toFixed(0)}` : "—",
        game: "Pokémon TCG",
      })));
    } catch {}
    setHotCards(HOT_CARDS.map(c => ({
      ...c,
      image: `https://en.onepiece-cardgame.com/images/cardlist/card/${c.code}.png`,
    })));
  }

  const allHotCards = [...hotCards, ...pkCards].slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <FloatingCharacters />
      <style>{`
        html, body { background: #000008; margin: 0; padding: 0; }
        @keyframes floatCard { 0%,100%{transform:translateY(0px) rotate(var(--rotate))} 50%{transform:translateY(-18px) rotate(calc(var(--rotate)*-0.5))} }
        @keyframes pulse { 0%,100%{opacity:0.06} 50%{opacity:0.15} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .card-float { animation: floatCard 6s ease-in-out infinite; }
        .card-float:hover { opacity:1!important; transform:scale(1.05)!important; z-index:50!important; }
        .hot-card:hover { transform: translateY(-6px) !important; border-color: rgba(0,153,255,0.5) !important; }
        .game-pill:hover { border-color: rgba(0,153,255,0.5) !important; background: rgba(0,153,255,0.08) !important; }
        .feature-card:hover { background: #0a1628 !important; }
        .cta-primary:hover { box-shadow: 0 8px 40px rgba(0,120,255,0.6) !important; transform: translateY(-2px); }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.3) !important; color: #ffffff !important; }
        .stat-card { position: relative; overflow: hidden; }
        .stat-card::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,153,255,0.06),transparent); animation: shimmer 3s infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(80px,15vw,120px) clamp(16px,5vw,48px) clamp(40px,8vw,80px)", position: "relative", overflow: "hidden" }}>

        {/* background glows */}
        <div style={{ position: "absolute", width: "900px", height: "900px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(0,100,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "400px", height: "400px", top: "5%", left: "8%", background: "radial-gradient(circle, rgba(0,80,255,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "400px", height: "400px", top: "5%", right: "8%", background: "radial-gradient(circle, rgba(0,80,255,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite 2s" }} />

        {/* floating cards */}
        {mounted && floatingCards.map((card, i) => (
          <div key={i} className="card-float" style={{ position: "absolute", left: card.x, top: card.y, width: `${card.size}px`, opacity: 0.18, animationDelay: `${card.delay}s`, animationDuration: `${5 + i * 0.7}s`, ["--rotate" as any]: `${card.rotate}deg`, pointerEvents: "none", zIndex: 1 }}>
            <img src={card.imageUrl} alt={card.name} style={{ width: "100%", borderRadius: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.9)" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
        ))}

        {/* hero content */}
        <div style={{ position: "relative", zIndex: 10, animation: "slideUp 0.8s ease both", maxWidth: "780px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", marginBottom: "28px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#0099ff", fontWeight: 500 }}>Web3 TCG Marketplace · Powered by Sui</span>
          </div>

          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(36px, 8vw, 96px)", fontWeight: 900, lineHeight: 1.02, marginBottom: "24px", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#ffffff", display: "block" }}>Ride the Wave.</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #0055ff 0%, #0099ff 40%, #00d4ff 80%, #00ffcc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Trade Any Card.</span>
          </h1>

          <p style={{ fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 300, color: "#8899bb", lineHeight: 1.8, marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }}>
            Buy, sell, and list <strong style={{ color: "#c8d8f0", fontWeight: 500 }}>One Piece TCG, Pokémon, Magic, Yu-Gi-Oh!</strong> and more — on Sui blockchain.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <a href="/marketplace" className="cta-primary" style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "15px 36px", borderRadius: "6px", textDecoration: "none", display: "inline-block", boxShadow: "0 4px 28px rgba(0,120,255,0.45)", transition: "all 0.2s" }}>Browse Marketplace</a>
            <a href="/sell" className="cta-secondary" style={{ background: "transparent", color: "#8899bb", fontSize: "13px", fontWeight: 500, padding: "15px 28px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>+ List a Card</a>
            <a href="/optcg" style={{ background: "transparent", color: "#8899bb", fontSize: "13px", fontWeight: 500, padding: "15px 28px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>🏴‍☠️ Tournaments</a>
          </div>

          {/* trust badges */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
            {["✓ Free to list", "✓ 1% fee only on sale", "✓ Sui blockchain", "✓ 8 TCG games"].map(badge => (
              <span key={badge} style={{ fontSize: "12px", color: "#444460", letterSpacing: "0.04em" }}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL STATS ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#050515" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(255,255,255,0.05)" }}>
          {[
            { num: stats.listings > 0 ? stats.listings.toLocaleString() : "—", label: "Active Listings", color: "#0099ff" },
            { num: stats.users > 0 ? stats.users.toLocaleString() : "—", label: "Collectors", color: "#00d4ff" },
            { num: stats.alerts > 0 ? stats.alerts.toLocaleString() : "—", label: "Price Alerts", color: "#00ffcc" },
            { num: "1%", label: "Platform Fee", color: "#0099ff" },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{ textAlign: "center", padding: "28px 16px", background: "#050515" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: stat.color, marginBottom: "6px" }}>{stat.num}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444460" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOT CARDS ── */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) clamp(12px, 4vw, 48px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px" }}>🔥 Trending Now</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 700, color: "#ffffff", margin: 0 }}>Hot Cards Today</h2>
          </div>
          <a href="/marketplace" style={{ fontSize: "12px", color: "#0099ff", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(0,153,255,0.25)", padding: "8px 18px", borderRadius: "6px", whiteSpace: "nowrap" }}>View All →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "14px" }}>
          {(allHotCards.length > 0 ? allHotCards : HOT_CARDS.map(c => ({ ...c, image: `https://en.onepiece-cardgame.com/images/cardlist/card/${c.code}.png` }))).map((card: any, i) => (
            <a key={i} href="/marketplace" style={{ textDecoration: "none" }}>
              <div className="hot-card" style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}>
                <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#0a0a15", position: "relative" }}>
                  <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>{card.name}</div>
                  <div style={{ fontSize: "10px", color: "#444460", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.info || card.game}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0099ff" }}>{card.price || card.priceDisplay}</span>
                    <span style={{ fontSize: "9px", color: "#0099ff", padding: "2px 7px", background: "rgba(0,153,255,0.1)", borderRadius: "4px", border: "1px solid rgba(0,153,255,0.2)" }}>Buy</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── GAMES ── */}
      <section style={{ padding: "clamp(32px, 5vw, 60px) clamp(12px, 4vw, 48px)", background: "#050515", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "8px" }}>Supported Games</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(18px, 3vw, 32px)", fontWeight: 700, color: "#ffffff", margin: 0 }}>All your favorite TCGs</h2>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {GAMES.map((game, i) => (
              <a key={i} href={game.href} style={{ textDecoration: "none" }}>
                <div className="game-pill" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "60px", background: "#0a0a15", cursor: "pointer", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "18px" }}>{game.icon}</span>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{game.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) clamp(12px, 4vw, 48px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px" }}>Why WaveTCG</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 4vw, 44px)", fontWeight: 700, color: "#ffffff" }}>Built for collectors</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", overflow: "hidden" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: "#050515", padding: "36px 32px", transition: "background 0.2s", cursor: "default" }}>
              <div style={{ fontSize: "30px", marginBottom: "16px" }}>{f.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "10px" }}>{f.title}</div>
              <p style={{ fontSize: "13px", color: "#444460", lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "clamp(60px, 8vw, 120px) clamp(16px, 4vw, 48px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden", background: "#050515" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,100,255,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "20px", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "#00ff88", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live on Sui Mainnet</span>
          </div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, color: "#ffffff", marginBottom: "14px", lineHeight: 1.1 }}>Ready to ride the wave?</h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#444460", marginBottom: "40px", fontWeight: 300 }}>Join collectors trading on WaveTCG today.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/marketplace" className="cta-primary" style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "16px 40px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-block", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 28px rgba(0,120,255,0.45)", transition: "all 0.2s" }}>Browse Cards</a>
            <a href="/optcg" style={{ background: "transparent", color: "#8899bb", padding: "16px 32px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", fontSize: "13px", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>🏴‍☠️ Join Tournament</a>
          </div>
        </div>
      </section>

    </div>
  );
}
