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
  { icon: "⛓️", title: "Sui Blockchain", desc: "Trade on Sui — fast, cheap, secure. Sub-second settlement, fees under $0.01." },
  { icon: "🤖", title: "AI Oracle", desc: "Ask anything about any TCG card. Prices, rulings, market trends, deck advice." },
  { icon: "🏴‍☠️", title: "OPTCG Tournaments", desc: "Compete in weekly One Piece TCG tournaments. Win SUI prizes on-chain." },
  { icon: "📈", title: "Price Checker", desc: "Compare prices across TCGPlayer, CardKingdom, and WaveTCG in one place." },
  { icon: "🎴", title: "Deck Builder", desc: "Build and save your OPTCG decks. Register directly for tournaments." },
];

const GAMES = [
  { icon: "☠️", name: "One Piece TCG", href: "/marketplace?game=onepiece" },
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
  const [suiPrice, setSuiPrice] = useState(0);

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
    fetch("/api/sui-price").then(r => r.json()).then(d => setSuiPrice(d.price || 0));
  }, []);

  async function fetchStats() {
    try {
      const [listingsRes, usersRes, alertsRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("price_alerts").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats({ listings: listingsRes.count || 0, users: usersRes.count || 0, alerts: alertsRes.count || 0 });
    } catch {}
  }

  async function fetchHotCards() {
    try {
      const pkRes = await fetch("https://api.pokemontcg.io/v2/cards?q=name:charizard&pageSize=4&orderBy=-cardmarket.prices.averageSellPrice");
      const pkData = await pkRes.json();
      if (pkData.data) setPkCards(pkData.data.slice(0, 4).map((c: any) => ({
        name: c.name, image: c.images?.large, info: c.set?.name,
        price: c.cardmarket?.prices?.averageSellPrice ? `$${c.cardmarket.prices.averageSellPrice.toFixed(0)}` : "—",
        game: "Pokémon TCG",
      })));
    } catch {}
    setHotCards(HOT_CARDS.map(c => ({ ...c, image: `https://en.onepiece-cardgame.com/images/cardlist/card/${c.code}.png` })));
  }

  const allHotCards = [...hotCards, ...pkCards].slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: "#000008", fontFamily: "DM Sans, sans-serif" }}>
      <FloatingCharacters />
      <style>{`
        html,body{background:#000008;margin:0;padding:0}
        @keyframes floatCard{0%,100%{transform:translateY(0px) rotate(var(--rotate))}50%{transform:translateY(-18px) rotate(calc(var(--rotate)*-0.5))}}
        @keyframes pulse{0%,100%{opacity:0.06}50%{opacity:0.15}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
        .card-float{animation:floatCard 6s ease-in-out infinite}
        .card-float:hover{opacity:1!important;transform:scale(1.05)!important;z-index:50!important}
        .hot-card:hover{transform:translateY(-6px)!important;border-color:rgba(0,153,255,0.4)!important;box-shadow:0 20px 40px rgba(0,0,0,0.6)!important}
        .game-pill:hover{border-color:rgba(0,153,255,0.4)!important;background:rgba(0,153,255,0.06)!important;transform:translateY(-1px)}
        .feature-card:hover{background:#060618!important;border-color:rgba(0,153,255,0.1)!important}
        .cta-primary:hover{box-shadow:0 8px 40px rgba(0,120,255,0.55)!important;transform:translateY(-2px)}
        .cta-secondary:hover{border-color:rgba(255,255,255,0.25)!important;color:#fff!important}
        .stat-card{position:relative;overflow:hidden}
        .stat-card::after{content:\'\';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,153,255,0.05),transparent);animation:shimmer 3s infinite}
      `}</style>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(80px,15vw,120px) clamp(16px,5vw,48px) clamp(40px,8vw,80px)", position: "relative", overflow: "hidden" }}>
        {/* Glows */}
        <div style={{ position: "absolute", width: "1000px", height: "1000px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(0,80,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", top: "5%", left: "5%", background: "radial-gradient(circle, rgba(0,60,255,0.04) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", top: "5%", right: "5%", background: "radial-gradient(circle, rgba(0,60,255,0.04) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite 2s" }} />

        {/* Floating cards */}
        {mounted && floatingCards.map((card, i) => (
          <div key={i} className="card-float" style={{ position: "absolute", left: card.x, top: card.y, width: `${card.size}px`, opacity: 0.15, animationDelay: `${card.delay}s`, animationDuration: `${5 + i * 0.7}s`, ["--rotate" as any]: `${card.rotate}deg`, pointerEvents: "none", zIndex: 1 }}>
            <img src={card.imageUrl} alt={card.name} style={{ width: "100%", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.9)" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
        ))}

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, animation: "slideUp 0.8s ease both", maxWidth: "800px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(0,153,255,0.07)", border: "1px solid rgba(0,153,255,0.18)", borderRadius: "20px", marginBottom: "32px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#0099ff", fontWeight: 500 }}>Web3 TCG Marketplace · Live on Sui Mainnet</span>
          </div>

          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(38px,8vw,96px)", fontWeight: 900, lineHeight: 1.02, marginBottom: "24px", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#ffffff", display: "block" }}>Ride the Wave.</span>
            <span style={{ display: "block", background: "linear-gradient(135deg,#0055ff 0%,#0099ff 40%,#00d4ff 80%,#00ffcc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Trade Any Card.</span>
          </h1>

          <p style={{ fontSize: "clamp(14px,2.5vw,18px)", fontWeight: 300, color: "#6677aa", lineHeight: 1.8, margin: "0 auto 40px", maxWidth: "560px" }}>
            Buy, sell, and list <strong style={{ color: "#c8d8f0", fontWeight: 500 }}>One Piece TCG, Pokémon, Magic, Yu-Gi-Oh!</strong> and more — on Sui blockchain. Zero chargebacks. Instant payment.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <a href="/marketplace" className="cta-primary" style={{ background: "linear-gradient(135deg,#0055ff,#0099ff)", color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 36px", borderRadius: "8px", textDecoration: "none", display: "inline-block", boxShadow: "0 4px 28px rgba(0,120,255,0.4)", transition: "all 0.2s" }}>Browse Marketplace</a>
            <a href="/sell" className="cta-secondary" style={{ background: "transparent", color: "#8899bb", fontSize: "13px", fontWeight: 500, padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>+ List a Card</a>
            <a href="/optcg" className="cta-secondary" style={{ background: "transparent", color: "#8899bb", fontSize: "13px", fontWeight: 500, padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>☠️ Tournaments</a>
          </div>

          <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
            {["✓ Free to list", "✓ 1% fee only on sale", "✓ Sui blockchain", "✓ 8 TCG games supported"].map(badge => (
              <span key={badge} style={{ fontSize: "12px", color: "#333355", letterSpacing: "0.04em" }}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#030312" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1px", background: "rgba(255,255,255,0.04)" }}>
          {[
            { num: stats.listings > 0 ? stats.listings.toLocaleString() : "0", label: "Active Listings", color: "#0099ff" },
            { num: stats.users > 0 ? stats.users.toLocaleString() : "0", label: "Collectors", color: "#00d4ff" },
            { num: stats.alerts > 0 ? stats.alerts.toLocaleString() : "0", label: "Price Alerts", color: "#00ffcc" },
            { num: "1%", label: "Platform Fee", color: "#0099ff" },
            { num: suiPrice > 0 ? "$" + suiPrice.toFixed(3) : "—", label: "SUI Price", color: "#00d4ff" },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ textAlign: "center", padding: "28px 16px", background: "#030312" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(20px,3vw,34px)", fontWeight: 700, color: s.color, marginBottom: "6px" }}>{s.num}</div>
              <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#333355" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOT CARDS */}
      <section style={{ padding: "clamp(40px,6vw,80px) clamp(12px,4vw,48px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px" }}>🔥 Trending Now</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(20px,4vw,38px)", fontWeight: 700, color: "#fff", margin: 0 }}>Hot Cards Today</h2>
          </div>
          <a href="/marketplace" style={{ fontSize: "11px", color: "#0099ff", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(0,153,255,0.2)", padding: "8px 18px", borderRadius: "6px" }}>View All →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px" }}>
          {(allHotCards.length > 0 ? allHotCards : HOT_CARDS.map(c => ({ ...c, image: `https://en.onepiece-cardgame.com/images/cardlist/card/${c.code}.png` }))).map((card: any, i) => (
            <a key={i} href="/marketplace" style={{ textDecoration: "none" }}>
              <div className="hot-card" style={{ background: "#030312", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}>
                <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#080820" }}>
                  <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>{card.name}</div>
                  <div style={{ fontSize: "10px", color: "#333355", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.info || card.game}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0099ff" }}>{card.price}</span>
                    <span style={{ fontSize: "9px", color: "#0099ff", padding: "2px 7px", background: "rgba(0,153,255,0.08)", borderRadius: "4px", border: "1px solid rgba(0,153,255,0.15)" }}>Buy</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GAMES */}
      <section style={{ padding: "clamp(32px,5vw,60px) clamp(12px,4vw,48px)", background: "#030312", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "8px" }}>Supported Games</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(18px,3vw,32px)", fontWeight: 700, color: "#fff", margin: 0 }}>All your favorite TCGs</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {GAMES.map((g, i) => (
              <a key={i} href={g.href} style={{ textDecoration: "none" }}>
                <div className="game-pill" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "60px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "18px" }}>{g.icon}</span>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "12px", fontWeight: 600, color: "#fff" }}>{g.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(40px,6vw,80px) clamp(12px,4vw,48px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "10px" }}>Why WaveTCG</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px,4vw,44px)", fontWeight: 700, color: "#fff" }}>Built for collectors</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", overflow: "hidden" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: "#030312", padding: "36px 32px", transition: "all 0.2s", cursor: "default", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{f.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "10px" }}>{f.title}</div>
              <p style={{ fontSize: "13px", color: "#333355", lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(16px,4vw,48px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden", background: "#030312" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,rgba(0,80,255,0.05) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: "20px", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "#00ff88", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live on Sui Mainnet</span>
          </div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, color: "#fff", marginBottom: "14px", lineHeight: 1.1 }}>Ready to ride the wave?</h2>
          <p style={{ fontSize: "clamp(14px,2vw,17px)", color: "#444466", marginBottom: "40px", fontWeight: 300 }}>Join collectors trading on WaveTCG today.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/marketplace" className="cta-primary" style={{ background: "linear-gradient(135deg,#0055ff,#0099ff)", color: "#fff", padding: "15px 40px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-block", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 28px rgba(0,120,255,0.4)", transition: "all 0.2s" }}>Browse Cards</a>
            <a href="/optcg" className="cta-secondary" style={{ background: "transparent", color: "#8899bb", padding: "15px 32px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "13px", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}>☠️ Join Tournament</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#020210", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "48px clamp(12px,4vw,48px) 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "60px", marginBottom: "40px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>WaveTCG</div>
              <p style={{ fontSize: "12px", color: "#222240", lineHeight: 1.7, fontWeight: 300 }}>The Web3 TCG Marketplace built on Sui blockchain.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
              {[
                { title: "Market", links: [{ l: "Browse Cards", h: "/marketplace" }, { l: "List a Card", h: "/sell" }, { l: "Price Checker", h: "/price-checker" }, { l: "Alerts", h: "/alerts" }] },
                { title: "Features", links: [{ l: "AI Oracle", h: "/oracle" }, { l: "Tournaments", h: "/optcg" }, { l: "Deck Builder", h: "/deckbuilder" }, { l: "Portfolio", h: "/portfolio" }] },
                { title: "Account", links: [{ l: "Dashboard", h: "/dashboard" }, { l: "Orders", h: "/orders" }, { l: "Swap", h: "/swap" }, { l: "Analytics", h: "/analytics" }] },
                { title: "Help", links: [{ l: "Guide", h: "/guide" }, { l: "FAQ", h: "/guide?tab=faq" }, { l: "Collectors", h: "/users" }, { l: "Download", h: "/download" }] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#0099ff", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "14px" }}>{col.title}</div>
                  {col.links.map((lk, j) => <a key={j} href={lk.h} style={{ display: "block", fontSize: "12px", color: "#222240", textDecoration: "none", marginBottom: "9px", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#0099ff")} onMouseLeave={e => (e.currentTarget.style.color = "#222240")}>{lk.l}</a>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#161630" }}>© 2026 WaveTCG · Built on Sui Blockchain</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {["1% fee", "Free listings", "Instant pay", "On-chain"].map((t, i) => (
                <span key={i} style={{ fontSize: "10px", padding: "3px 9px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "5px", color: "#161630" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
