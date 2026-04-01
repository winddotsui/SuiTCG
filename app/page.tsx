"use client";
import dynamic from "next/dynamic";
const FloatingCharacters = dynamic(() => import("./components/FloatingCharacters"), { ssr: false });
import { useEffect, useState } from "react";

interface CardImage {
  name: string;
  game: string;
  imageUrl: string;
  price: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  rotate: number;
}

const OPTCG_FLAGSHIP = [
  { code: "OP01-001", name: "Roronoa Zoro", label: "OP01 Leader" },
  { code: "OP01-003", name: "Monkey D. Luffy", label: "OP01 Leader" },
  { code: "OP01-031", name: "Kouzuki Oden", label: "OP01 Leader" },
  { code: "OP01-060", name: "Donquixote Doflamingo", label: "OP01 Leader" },
  { code: "OP02-001", name: "Edward Newgate", label: "OP02 Leader" },
  { code: "OP03-001", name: "Monkey D. Luffy", label: "OP03 Leader" },
];

function getOfficialImage(code: string) {
  return `https://en.onepiece-cardgame.com/images/cardlist/card/${code}.png`;
}

export default function Home() {
  const [cards, setCards] = useState<CardImage[]>([]);
  const [heroCards, setHeroCards] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const positions = [
      { x: "2%", y: "20%", size: 130, delay: 0, rotate: -8 },
      { x: "80%", y: "15%", size: 120, delay: 0.5, rotate: 6 },
      { x: "88%", y: "55%", size: 115, delay: 1, rotate: -4 },
      { x: "0%", y: "60%", size: 120, delay: 1.5, rotate: 5 },
      { x: "75%", y: "78%", size: 110, delay: 0.8, rotate: -6 },
      { x: "5%", y: "82%", size: 115, delay: 1.2, rotate: 4 },
    ];
    setCards(OPTCG_FLAGSHIP.map((card, i) => ({
      name: card.name, game: card.label,
      imageUrl: getOfficialImage(card.code),
      price: "", ...positions[i],
    })));
    async function loadHotCards() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

    // One Piece hot cards pool
    const optcgPool = [
      { code: "OP05-119", name: "Monkey D. Luffy", info: "Gear 5 SEC", price: "$380" },
      { code: "OP02-013", name: "Monkey D. Luffy", info: "Purple SEC", price: "$290" },
      { code: "OP01-025", name: "Roronoa Zoro", info: "SR Red", price: "$120" },
      { code: "OP01-070", name: "Dracule Mihawk", info: "SR Blue", price: "$85" },
      { code: "OP06-001", name: "Shanks", info: "Leader OP06", price: "$75" },
      { code: "OP08-001", name: "Gol D. Roger", info: "Leader OP08", price: "$95" },
      { code: "OP03-040", name: "Boa Hancock", info: "SR Black", price: "$65" },
      { code: "OP04-003", name: "Monkey D. Luffy", info: "Leader Yellow", price: "$55" },
    ];

    // Pokemon hot cards pool
    const pokemonPool = [
      { id: "xy7-74", name: "Charizard EX", info: "Pokémon TCG · XY", price: "$180" },
      { id: "swsh45sv-SV122", name: "Charizard V", info: "Pokémon TCG · SWSH", price: "$95" },
      { id: "base1-4", name: "Charizard", info: "Pokémon TCG · Base Set", price: "$450" },
      { id: "swsh12pt5-160", name: "Pikachu VMAX", info: "Pokémon TCG · Crown Zenith", price: "$75" },
      { id: "swsh9-196", name: "Umbreon VMAX Alt", info: "Pokémon TCG · Brilliant Stars", price: "$220" },
      { id: "sv1-198", name: "Miraidon ex", info: "Pokémon TCG · Scarlet & Violet", price: "$85" },
    ];

    // MTG hot cards pool  
    const mtgPool = [
      { name: "Black Lotus", set: "lea", info: "Magic · Alpha", price: "$4,200" },
      { name: "Ragavan, Nimble Pilferer", set: "mh2", info: "Magic · MH2", price: "$65" },
      { name: "Wrenn and Six", set: "mh1", info: "Magic · MH1", price: "$85" },
      { name: "Oko, Thief of Crowns", set: "eld", info: "Magic · Eldraine", price: "$18" },
      { name: "Orcish Bowmasters", set: "ltr", info: "Magic · LOTR", price: "$45" },
      { name: "The One Ring", set: "ltr", info: "Magic · LOTR", price: "$38" },
    ];

    // F&B hot cards pool
    const fabPool = [
      { name: "Phantasmal Footsteps", info: "Flesh & Blood · Uprising", price: "$320", img: "https://storage.googleapis.com/fabdb-image/cards/regular/UPR000.webp" },
      { name: "Zen, Tamer of Purpose", info: "Flesh & Blood · Uprising", price: "$180", img: "https://storage.googleapis.com/fabdb-image/cards/regular/UPR001.webp" },
      { name: "Arakni, Solitary Confinement", info: "Flesh & Blood · Heavy Hitters", price: "$145", img: "https://storage.googleapis.com/fabdb-image/cards/regular/HVY000.webp" },
      { name: "Dash", info: "Flesh & Blood · Welcome to Rathe", price: "$95", img: "https://storage.googleapis.com/fabdb-image/cards/regular/WTR000.webp" },
    ];

    const optcg = optcgPool[dayOfYear % optcgPool.length];
    const pokemon = pokemonPool[dayOfYear % pokemonPool.length];
    const mtg = mtgPool[dayOfYear % mtgPool.length];
    const fab = fabPool[dayOfYear % fabPool.length];

    // Fetch real Pokemon image
    try {
      const pkRes = await fetch(`https://api.pokemontcg.io/v2/cards/${pokemon.id}`);
      const pkData = await pkRes.json();
      const pkImg = pkData.data?.images?.large || "";

      // Fetch real MTG image
      const mtgRes = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(mtg.name)}`);
      const mtgData = await mtgRes.json();
      const mtgImg = mtgData.image_uris?.normal || mtgData.card_faces?.[0]?.image_uris?.normal || "";

      setHeroCards([
        { name: optcg.name, images: { large: getOfficialImage(optcg.code) }, game: `One Piece TCG · ${optcg.info}`, priceDisplay: optcg.price, hot: true },
        { name: pokemon.name, images: { large: pkImg }, game: pokemon.info, priceDisplay: pokemon.price, hot: true },
        { name: mtg.name, images: { large: mtgImg }, game: mtg.info, priceDisplay: mtg.price, hot: true },
        { name: fab.name, images: { large: fab.img }, game: fab.info, priceDisplay: fab.price, hot: true },
      ]);
    } catch {
      setHeroCards([
        { name: optcg.name, images: { large: getOfficialImage(optcg.code) }, game: `One Piece TCG · ${optcg.info}`, priceDisplay: optcg.price },
      ]);
    }
    }
    loadHotCards();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000000", overflow: "hidden" }}>
      <FloatingCharacters />
      <style>{`
        @keyframes floatCard { 0%,100%{transform:translateY(0px) rotate(var(--rotate))} 50%{transform:translateY(-18px) rotate(calc(var(--rotate)*-0.5))} }
        @keyframes pulse { 0%,100%{opacity:0.06} 50%{opacity:0.15} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 20px rgba(0,120,255,0.2)} 50%{box-shadow:0 0 40px rgba(0,120,255,0.5)} }
        .card-float{animation:floatCard 6s ease-in-out infinite}
        .card-float:hover{opacity:1!important;transform:scale(1.05)!important;z-index:50!important}
      `}</style>

      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 48px 80px", position:"relative" }}>
        <div style={{ position:"absolute", width:"800px", height:"800px", top:"10%", left:"50%", transform:"translateX(-50%)", background:"radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:"400px", height:"400px", top:"5%", left:"10%", background:"radial-gradient(circle, rgba(0,80,255,0.04) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 4s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"400px", height:"400px", top:"5%", right:"10%", background:"radial-gradient(circle, rgba(0,80,255,0.04) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 4s ease-in-out infinite 2s" }} />

        {mounted && cards.map((card, i) => (
          <div key={i} className="card-float" style={{ position:"absolute", left:card.x, top:card.y, width:`${card.size}px`, opacity:0.2, animationDelay:`${card.delay}s`, animationDuration:`${5+i*0.7}s`, ["--rotate" as any]:`${card.rotate}deg`, pointerEvents:"none", zIndex:1 }}>
            <img src={card.imageUrl} alt={card.name} style={{ width:"100%", borderRadius:"8px", boxShadow:"0 8px 32px rgba(0,0,0,0.9)", display:"block" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
          </div>
        ))}

        <div style={{ position:"relative", zIndex:10, animation:"slideUp 0.8s ease both" }}>
          <div style={{ fontSize:"11px", fontWeight:500, letterSpacing:"0.22em", textTransform:"uppercase", color:"#0078ff", marginBottom:"24px", display:"flex", alignItems:"center", gap:"10px", justifyContent:"center" }}>
            <span style={{ display:"block", width:"32px", height:"1px", background:"#0078ff", opacity:0.6 }} />
            Web3 TCG Marketplace · Powered by Sui
            <span style={{ display:"block", width:"32px", height:"1px", background:"#0078ff", opacity:0.6 }} />
          </div>
          <h1 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(44px, 7vw, 88px)", fontWeight:900, lineHeight:1.05, marginBottom:"28px" }}>
            <span style={{ color:"#ffffff", display:"block" }}>Ride the Wave.</span>
            <span style={{ display:"block", background:"linear-gradient(135deg, #0050ff 0%, #0078ff 40%, #00b4ff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Trade Any Card.</span>
          </h1>
          <p style={{ maxWidth:"520px", fontSize:"17px", fontWeight:300, color:"#666680", lineHeight:1.75, marginBottom:"48px", margin:"0 auto 48px" }}>
            Buy, sell, and list <strong style={{ color:"#ffffff", fontWeight:500 }}>One Piece TCG, Pokémon, Magic, Yu-Gi-Oh!</strong> and more — on Sui blockchain.
          </p>
          <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/marketplace" style={{ background:"linear-gradient(135deg, #0050ff, #0078ff)", color:"#fff", fontSize:"14px", fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase", padding:"14px 32px", borderRadius:"4px", textDecoration:"none", display:"inline-block", boxShadow:"0 4px 24px rgba(0,120,255,0.4)" }}>Browse Marketplace</a>
            <a href="/optcg" style={{ background:"transparent", color:"#888898", fontSize:"14px", padding:"14px 28px", borderRadius:"4px", border:"1px solid rgba(255,255,255,0.1)", textDecoration:"none", display:"inline-block" }}>🏴‍☠️ OPTCG Tournament</a>
          </div>
        </div>
      </section>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"36px 48px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", background:"#050510" }}>
        {[
          { num:"120K+", label:"Cards Listed" },
          { num:"8", label:"TCG Games" },
          { num:"Sui", label:"Blockchain" },
          { num:"1%", label:"Platform Fee" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign:"center", padding:"0 24px", borderRight:i<3?"1px solid rgba(255,255,255,0.06)":"none" }}>
            <div style={{ fontFamily:"Cinzel, serif", fontSize:"32px", fontWeight:600, color:"#0078ff", letterSpacing:"-0.02em", marginBottom:"6px" }}>{stat.num}</div>
            <div style={{ fontSize:"12px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#555570" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <section style={{ padding:"80px 48px", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#0078ff", marginBottom:"16px" }}>Today's Hot Cards</div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
          <h2 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(28px, 4vw, 48px)", fontWeight:600, color:"#ffffff" }}>Hot Cards Today</h2>
          <span style={{ padding:"4px 12px", background:"rgba(255,50,50,0.1)", border:"1px solid rgba(255,50,50,0.3)", borderRadius:"20px", fontSize:"12px", color:"#ff6b6b", fontWeight:600 }}>🔥 Daily</span>
        </div>
        <p style={{ fontSize:"13px", color:"#444460", marginBottom:"48px" }}>Updates every day · Best card from each TCG</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"20px" }}>
          {heroCards.map((card, i) => (
            <a key={i} href="/marketplace" style={{ textDecoration:"none" }}>
              <div style={{ background:"#050510", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", overflow:"hidden", cursor:"pointer", transition:"transform 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,120,255,0.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.06)"; }}
              >
                <div style={{ width:"100%", aspectRatio:"3/4", overflow:"hidden", background:"#0a0a15" }}>
                  <img src={card.images?.large} alt={card.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                </div>
                <div style={{ padding:"14px" }}>
                  <div style={{ fontFamily:"Cinzel, serif", fontSize:"13px", fontWeight:600, color:"#ffffff", marginBottom:"4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{card.name}</div>
                  <div style={{ fontSize:"11px", color:"#555570", marginBottom:"10px" }}>{card.game}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:"16px", fontWeight:500, color:"#0078ff" }}>{card.priceDisplay}</div>
                    <div style={{ fontSize:"10px", color:"#0078ff", padding:"3px 8px", background:"rgba(0,120,255,0.1)", borderRadius:"4px", border:"1px solid rgba(0,120,255,0.2)" }}>Buy</div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <a href="/marketplace" style={{ display:"inline-block", padding:"12px 32px", border:"1px solid rgba(0,120,255,0.3)", borderRadius:"6px", color:"#0078ff", fontSize:"13px", textDecoration:"none", letterSpacing:"0.06em", textTransform:"uppercase" }}>View All Cards →</a>
        </div>
      </section>

      <section style={{ padding:"80px 48px", background:"#050510", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#0078ff", marginBottom:"16px" }}>Supported Games</div>
          <h2 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(28px, 4vw, 48px)", fontWeight:600, color:"#ffffff", marginBottom:"48px" }}>All your favorite TCGs</h2>
          <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
            {[
              { icon:"🏴‍☠️", name:"One Piece TCG" },
              { icon:"⚡", name:"Pokémon TCG" },
              { icon:"✨", name:"Magic: The Gathering" },
              { icon:"👁️", name:"Yu-Gi-Oh!" },
              { icon:"🐉", name:"Dragon Ball" },
              { icon:"🌟", name:"Lorcana" },
              { icon:"⚔️", name:"Flesh & Blood" },
              { icon:"🎭", name:"Digimon" },
            ].map((game, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"16px 24px", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"60px", background:"#0a0a15", cursor:"pointer", transition:"border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,120,255,0.4)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.08)"}
              >
                <span style={{ fontSize:"22px" }}>{game.icon}</span>
                <span style={{ fontFamily:"Cinzel, serif", fontSize:"13px", fontWeight:600, color:"#ffffff" }}>{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding:"80px 48px", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#0078ff", marginBottom:"16px" }}>Why WaveTCG</div>
        <h2 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(28px, 4vw, 48px)", fontWeight:600, color:"#ffffff", marginBottom:"48px" }}>Built for collectors</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"2px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", overflow:"hidden" }}>
          {[
            { icon:"🃏", title:"Free Listings", desc:"List any card for free. We only take 1% when it sells — paid automatically on-chain." },
            { icon:"⛓️", title:"Sui Blockchain", desc:"Trade on Sui blockchain. Fast, cheap, and secure. Use any Sui wallet." },
            { icon:"🤖", title:"AI Oracle", desc:"Ask anything about any TCG card. Prices, rulings, market trends, deck advice." },
            { icon:"🏴‍☠️", title:"OPTCG Tournaments", desc:"Compete in weekly One Piece TCG tournaments. Win SUI prizes paid on-chain." },
            { icon:"📈", title:"Price Checker", desc:"Compare prices across TCGPlayer, CardKingdom, and WaveTCG in one place." },
            { icon:"🃏", title:"Deck Builder", desc:"Build and save your OPTCG decks. Register directly for tournaments." },
          ].map((f, i) => (
            <div key={i} style={{ background:"#050510", padding:"40px 36px", transition:"background 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background="#0a0a18"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background="#050510"}
            >
              <div style={{ fontSize:"32px", marginBottom:"20px" }}>{f.icon}</div>
              <div style={{ fontFamily:"Cinzel, serif", fontSize:"16px", fontWeight:600, color:"#ffffff", marginBottom:"12px" }}>{f.title}</div>
              <p style={{ fontSize:"14px", color:"#555570", lineHeight:1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"100px 48px", textAlign:"center", borderTop:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, rgba(0,120,255,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />
        <h2 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(28px, 4vw, 48px)", fontWeight:900, color:"#ffffff", marginBottom:"16px" }}>Ready to ride the wave?</h2>
        <p style={{ fontSize:"16px", color:"#555570", marginBottom:"40px", fontWeight:300 }}>Join thousands of collectors on WaveTCG.</p>
        <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
          <a href="/marketplace" style={{ background:"linear-gradient(135deg, #0050ff, #0078ff)", color:"#fff", padding:"14px 32px", borderRadius:"4px", fontSize:"14px", fontWeight:500, textDecoration:"none", display:"inline-block", letterSpacing:"0.05em", textTransform:"uppercase", boxShadow:"0 4px 24px rgba(0,120,255,0.4)" }}>Browse Cards</a>
          <a href="/optcg" style={{ background:"transparent", color:"#888898", padding:"14px 28px", borderRadius:"4px", border:"1px solid rgba(255,255,255,0.1)", fontSize:"14px", textDecoration:"none", display:"inline-block" }}>🏴‍☠️ Join Tournament</a>
        </div>
      </section>
    </div>
  );
}
