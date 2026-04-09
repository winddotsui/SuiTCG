"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const HOT_CARDS = [
  { code:"OP05-119", name:"Monkey D. Luffy", set:"Awakening of the New Era", rarity:"SEC", price:"$380", sui:"407", rarityColor:"#7C3AED" },
  { code:"OP01-003", name:"Monkey D. Luffy", set:"Romance Dawn", rarity:"L", price:"$356", sui:"381", rarityColor:"#D4AF37" },
  { code:"OP02-001", name:"Edward Newgate", set:"Paramount War", rarity:"L", price:"$210", sui:"224", rarityColor:"#D4AF37" },
  { code:"OP06-001", name:"Shanks", set:"Wings of Captain", rarity:"L", price:"$145", sui:"155", rarityColor:"#D4AF37" },
  { code:"OP04-090", name:"Monkey D. Luffy", set:"Kingdoms of Intrigue", rarity:"SR", price:"$89", sui:"95", rarityColor:"#00D4FF" },
  { code:"OP01-001", name:"Roronoa Zoro", set:"Romance Dawn", rarity:"SR", price:"$65", sui:"69", rarityColor:"#00D4FF" },
  { code:"OP07-109", name:"Monkey D. Luffy", set:"500 Years in Future", rarity:"SR", price:"$38", sui:"40", rarityColor:"#00D4FF" },
  { code:"OP09-119", name:"Monkey D. Luffy", set:"Emperors in New World", rarity:"SEC", price:"$28", sui:"29", rarityColor:"#7C3AED" },
];

const FEATURES = [
  { icon:"🃏", t:"Free to List", d:"No upfront cost. List any card for free — pay just 1% when it sells.", c:"#00D4FF" },
  { icon:"⚡", t:"Instant Payment", d:"Sui blockchain settles in under a second. Get paid immediately.", c:"#7C3AED" },
  { icon:"🤖", t:"AI Card Oracle", d:"Claude AI identifies any card, gives real prices, rulings, and deck advice.", c:"#D4AF37" },
  { icon:"🔒", t:"Zero Chargebacks", d:"On-chain payments are final. No payment reversals or buyer fraud.", c:"#00D4FF" },
  { icon:"📊", t:"Price Comparison", d:"See WaveTCG vs TCGPlayer vs CardMarket prices side by side.", c:"#7C3AED" },
  { icon:"☠️", t:"OPTCG Tournaments", d:"Weekly Swiss bracket events with on-chain SUI prize pools.", c:"#D4AF37" },
];

const STEPS = [
  { n:"1", t:"Scan Your Card", d:"Take a photo — AI identifies it instantly and fills all details", icon:"📷" },
  { n:"2", t:"Set Your Price", d:"Price in USD, auto-converts to SUI. Compare vs market instantly", icon:"💰" },
  { n:"3", t:"Buyer Pays with SUI", d:"One-click purchase, 1% fee deducted automatically on-chain", icon:"⚡" },
  { n:"4", t:"Ship & Done", d:"Chat securely with buyer, confirm shipping, get your SUI", icon:"📦" },
];

export default function Home() {
  const [stats, setStats] = useState({ listings:0, users:0 });
  const [suiPrice, setSuiPrice] = useState(0.934);
  const [imgError, setImgError] = useState<Record<string,boolean>>({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchStats();
    fetch("/api/sui-price").then(r=>r.json()).then(d=>setSuiPrice(d.price||0.934)).catch(()=>{});
  }, []);

  async function fetchStats() {
    try {
      const [l,u] = await Promise.all([
        supabase.from("listings").select("id",{count:"exact",head:true}).eq("status","active"),
        supabase.from("profiles").select("id",{count:"exact",head:true}),
      ]);
      setStats({ listings:l.count||0, users:u.count||0 });
    } catch {}
  }

  const toggleDark = () => {
    const d = !darkMode;
    setDarkMode(d);
    document.body.classList.toggle("dark-mode", d);
  };

  const bg = darkMode ? "#111111" : "#FFFFED";
  const surface = darkMode ? "#1F2937" : "#FFFFFF";
  const text = darkMode ? "#F5F5F5" : "#1F2937";
  const muted = darkMode ? "#94A3B8" : "#64748B";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const surfaceBg = darkMode ? "#1a1a2e" : "#F5F5DC";

  return (
    <div style={{background:bg,color:text,fontFamily:"DM Sans,sans-serif",overflowX:"hidden",transition:"background 0.3s,color 0.3s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes shimmer{0%{left:-100%}100%{left:200%}}
        .fade-up{animation:fadeUp 0.6s ease both}
        .card-item{background:${surface};border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 0.3s cubic-bezier(0.23,1,0.32,1),box-shadow 0.3s ease;position:relative;border:1px solid ${border}}
        .card-item:hover{transform:translateY(-8px) scale(1.02);box-shadow:${darkMode?"0 20px 60px rgba(0,0,0,0.8)":"0 20px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(0,212,255,0.15)"}}
        .card-item .shine{position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:3}
        .card-item:hover .shine{opacity:1}
        .card-item .buy-now{opacity:0;transform:translateY(4px);transition:all 0.2s}
        .card-item:hover .buy-now{opacity:1;transform:translateY(0)}
        .btn-main{display:inline-flex;align-items:center;gap:8px;background:#00D4FF;color:#0A0A0A;border:none;border-radius:8px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:14px 28px;text-decoration:none}
        .btn-main:hover{background:#00E5FF;transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,212,255,0.35)}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:${text};border:1.5px solid ${border};border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:13px 22px;text-decoration:none}
        .btn-ghost:hover{border-color:#00D4FF;color:#00D4FF}
        .btn-purple{display:inline-flex;align-items:center;gap:8px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:14px 28px;text-decoration:none}
        .btn-purple:hover{background:#8B5CF6;transform:translateY(-1px);box-shadow:0 8px 28px rgba(124,58,237,0.35)}
        .feat-card{background:${surface};border:1px solid ${border};border-radius:14px;padding:28px;transition:all 0.25s;position:relative;overflow:hidden}
        .feat-card:hover{border-color:#00D4FF;transform:translateY(-3px);box-shadow:${darkMode?"0 12px 40px rgba(0,0,0,0.5)":"0 12px 40px rgba(0,0,0,0.08)"}}
        .feat-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--fc,#00D4FF);opacity:0;transition:opacity 0.25s;border-radius:14px 14px 0 0}
        .feat-card:hover::before{opacity:1}
        .step-card{background:${surface};border:1px solid ${border};border-radius:14px;padding:32px 24px;text-align:center;transition:all 0.25s;position:relative;overflow:hidden}
        .step-card:hover{border-color:#00D4FF;transform:translateY(-3px)}
        .step-num-bg{position:absolute;bottom:-10px;right:8px;font-size:80px;font-weight:900;color:${darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};line-height:1;pointer-events:none}
        .game-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1.5px solid ${border};border-radius:50px;background:${surface};cursor:pointer;transition:all 0.2s;text-decoration:none;white-space:nowrap;position:relative}
        .game-pill:hover{border-color:#00D4FF;box-shadow:0 4px 16px rgba(0,212,255,0.12);transform:translateY(-2px)}
        .testi{background:${surface};border:1px solid ${border};border-radius:14px;padding:28px;transition:all 0.25s}
        .testi:hover{border-color:rgba(0,212,255,0.3)}
        .stat-block{padding:28px 20px;text-align:center;background:${surface};border-right:1px solid ${border}}
        .stat-block:last-child{border-right:none}
        .dark-toggle{background:${darkMode?"#374151":"#F3F4F6"};border:1.5px solid ${border};border-radius:50px;padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;font-size:14px;font-family:DM Sans,sans-serif;color:${text}}
        @media(max-width:768px){
          .hot-grid{grid-template-columns:1fr 1fr!important}
          .feat-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .testi-grid{grid-template-columns:1fr!important}
          .stats-bar{grid-template-columns:1fr 1fr!important}
          .cta-btns{flex-direction:column!important;align-items:stretch!important}
          .oracle-layout{grid-template-columns:1fr!important}
          .footer-links{grid-template-columns:1fr 1fr!important}
          .footer-layout{grid-template-columns:1fr!important;gap:32px!important}
          .hero-btns{flex-direction:column!important;align-items:stretch!important}
        }
        @media(min-width:769px){
          .hot-grid{grid-template-columns:repeat(4,1fr)!important}
          .feat-grid{grid-template-columns:repeat(3,1fr)!important}
          .steps-grid{grid-template-columns:repeat(4,1fr)!important}
          .testi-grid{grid-template-columns:repeat(3,1fr)!important}
          .stats-bar{grid-template-columns:repeat(5,1fr)!important}
          .footer-links{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>

      {/* Dark mode toggle */}
      <div style={{position:"fixed",bottom:"24px",right:"24px",zIndex:1000}}>
        <button className="dark-toggle" onClick={toggleDark}>
          {darkMode ? "☀️" : "🌙"}
          <span style={{fontSize:"12px",fontWeight:500}}>{darkMode?"Light":"Dark"}</span>
        </button>
      </div>

      {/* HERO */}
      <section style={{minHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"clamp(100px,12vw,130px) clamp(20px,5vw,60px) clamp(60px,7vw,90px)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${darkMode?"rgba(0,212,255,0.04)":"rgba(0,212,255,0.05)"} 1px,transparent 1px),linear-gradient(90deg,${darkMode?"rgba(0,212,255,0.04)":"rgba(0,212,255,0.05)"} 1px,transparent 1px)`,backgroundSize:"80px 80px",maskImage:"radial-gradient(ellipse 70% 70% at 50% 40%,black 20%,transparent 100%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",width:"600px",height:"400px",top:"30%",left:"50%",transform:"translate(-50%,-50%)",background:`radial-gradient(ellipse,${darkMode?"rgba(0,212,255,0.06)":"rgba(0,212,255,0.07)"} 0%,transparent 65%)`,pointerEvents:"none"}} />

        <div style={{position:"relative",zIndex:10,maxWidth:"800px",width:"100%"}}>
          <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"6px 16px",background:darkMode?"rgba(0,212,255,0.08)":"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.25)",borderRadius:"50px",marginBottom:"32px"}}>
            <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00D4FF",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 8px rgba(0,212,255,0.8)"}} />
            <span style={{fontSize:"11px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00D4FF",fontWeight:700}}>Live on Sui Mainnet</span>
            <span style={{width:"1px",height:"12px",background:border}} />
            <span style={{fontSize:"11px",color:muted}}>SUI ${suiPrice.toFixed(3)}</span>
          </div>

          <h1 className="fade-up" style={{fontFamily:"Cinzel,serif",fontSize:"clamp(38px,7.5vw,88px)",fontWeight:900,lineHeight:1.0,marginBottom:"22px",letterSpacing:"-0.02em",animationDelay:"0.1s"}}>
            <span style={{display:"block",color:text}}>Ride the Wave.</span>
            <span style={{display:"block",background:"linear-gradient(135deg,#00D4FF 0%,#7C3AED 50%,#D4AF37 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"300%",animation:"gradShift 5s ease infinite"}}>Trade Any Card.</span>
          </h1>

          <p className="fade-up" style={{fontSize:"clamp(15px,2.2vw,18px)",color:muted,lineHeight:1.85,marginBottom:"40px",maxWidth:"560px",margin:"0 auto 40px",fontWeight:400,animationDelay:"0.2s"}}>
            Buy, sell & collect <strong style={{color:text,fontWeight:700}}>One Piece, Pokémon, Magic, Yu-Gi-Oh!</strong> and more. Free listings, 1% on-chain fee, instant Sui settlement.
          </p>

          <div className="hero-btns fade-up" style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"48px",animationDelay:"0.3s"}}>
            <a href="/marketplace" className="btn-main">🃏 Browse Marketplace</a>
            <a href="/sell" className="btn-ghost">+ List a Card</a>
            <a href="/scan" className="btn-ghost">📷 Scan Card</a>
            <a href="/oracle" className="btn-ghost">🤖 AI Oracle</a>
          </div>

          <div className="fade-up" style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap",animationDelay:"0.4s"}}>
            {["✓ Free to list","✓ 1% fee only","✓ Instant settlement","✓ 8 TCG games","✓ AI-powered"].map(b=>(
              <span key={b} style={{fontSize:"12px",color:muted,letterSpacing:"0.03em"}}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{background:surface,borderTop:`1px solid ${border}`,borderBottom:`1px solid ${border}`}}>
        <div className="stats-bar" style={{maxWidth:"1280px",margin:"0 auto",display:"grid"}}>
          {[
            {v:stats.listings>0?stats.listings.toLocaleString():"0",l:"Active Listings",c:"#00D4FF",i:"🃏"},
            {v:stats.users>0?stats.users.toLocaleString():"0",l:"Collectors",c:"#7C3AED",i:"👥"},
            {v:"1%",l:"Platform Fee",c:"#D4AF37",i:"⚡"},
            {v:`$${suiPrice.toFixed(3)}`,l:"SUI Price",c:"#00D4FF",i:"💎"},
            {v:"8+",l:"TCG Games",c:"#7C3AED",i:"🎮"},
          ].map((s,i)=>(
            <div key={i} className="stat-block">
              <div style={{fontSize:"20px",marginBottom:"10px"}}>{s.i}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"clamp(22px,3vw,36px)",fontWeight:800,color:s.c,marginBottom:"5px"}}>{s.v}</div>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:muted,fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRENDING CARDS */}
      <section style={{padding:"clamp(52px,6vw,88px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"32px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:"20px",marginBottom:"10px"}}>
              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#D4AF37",display:"inline-block",animation:"pulse 1.5s infinite"}} />
              <span style={{fontSize:"10px",color:"#D4AF37",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Live Prices</span>
            </div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(22px,4vw,42px)",fontWeight:700,color:text,margin:0}}>Trending Cards</h2>
          </div>
          <a href="/marketplace" style={{textDecoration:"none",fontSize:"13px",color:"#00D4FF",fontWeight:600,border:"1.5px solid rgba(0,212,255,0.3)",padding:"8px 18px",borderRadius:"8px",transition:"all 0.2s",display:"inline-block"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.06)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>View All →</a>
        </div>
        <div className="hot-grid" style={{display:"grid",gap:"14px"}}>
          {HOT_CARDS.map((card,i)=>(
            <a key={i} href="/marketplace" style={{textDecoration:"none"}}>
              <div className="card-item">
                <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:`linear-gradient(90deg,transparent,${card.rarityColor},transparent)`,zIndex:4}} />
                <div className="shine" />
                <div style={{width:"100%",aspectRatio:"3/4",overflow:"hidden",background:darkMode?`linear-gradient(160deg,${card.rarityColor}18,#1F2937)`:`linear-gradient(160deg,${card.rarityColor}08,#F5F5DC)`,position:"relative"}}>
                  {!imgError[card.code] ? (
                    <img src={`https://optcgapi.com/media/static/Card_Images/${card.code}.jpg`} alt={card.name}
                      style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.35s ease"}}
                      onError={()=>setImgError(p=>({...p,[card.code]:true}))}
                    />
                  ):(
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",padding:"20px",textAlign:"center"}}>
                      <span style={{fontSize:"36px"}}>🃏</span>
                      <span style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:muted,lineHeight:1.4}}>{card.name}</span>
                    </div>
                  )}
                  <div style={{position:"absolute",top:"8px",left:"8px",zIndex:4}}>
                    <span style={{fontSize:"9px",fontWeight:800,padding:"3px 8px",borderRadius:"5px",background:`${card.rarityColor}20`,color:card.rarityColor,border:`1px solid ${card.rarityColor}40`,letterSpacing:"0.1em"}}>{card.rarity}</span>
                  </div>
                </div>
                <div style={{padding:"14px 16px 16px"}}>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:700,color:text,marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
                  <div style={{fontSize:"10px",color:muted,marginBottom:"12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.set}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <span style={{fontFamily:"Cinzel,serif",fontSize:"17px",fontWeight:800,color:text}}>{card.price}</span>
                    <span style={{fontSize:"10px",color:muted}}>{card.sui} SUI</span>
                  </div>
                  <button className="buy-now" style={{width:"100%",background:"#00D4FF",color:"#0A0A0A",border:"none",padding:"9px",borderRadius:"7px",fontSize:"12px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Buy Now →</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GAMES */}
      <section style={{padding:"clamp(36px,4vw,60px) clamp(20px,5vw,60px)",background:surfaceBg,borderTop:`1px solid ${border}`,borderBottom:`1px solid ${border}`}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00D4FF",marginBottom:"8px",fontWeight:700}}>Supported Games</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(18px,3vw,32px)",fontWeight:700,color:text,margin:0}}>All Your Favorite TCGs</h2>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {i:"☠️",n:"One Piece TCG",h:"/marketplace?game=onepiece",hot:true},
              {i:"⚡",n:"Pokémon TCG",h:"/marketplace?game=pokemon"},
              {i:"✨",n:"Magic: TG",h:"/marketplace?game=magic"},
              {i:"👁️",n:"Yu-Gi-Oh!",h:"/marketplace?game=yugioh"},
              {i:"🐉",n:"Dragon Ball",h:"/marketplace?game=dragonball"},
              {i:"🌟",n:"Lorcana",h:"/marketplace?game=lorcana"},
              {i:"⚔️",n:"Flesh & Blood",h:"/marketplace?game=fab"},
              {i:"🎭",n:"Digimon",h:"/marketplace?game=digimon"},
            ].map((g,i)=>(
              <a key={i} href={g.h} className="game-pill" style={{textDecoration:"none"}}>
                {g.hot && <span style={{position:"absolute",top:"-7px",right:"-5px",background:"#D4AF37",color:"#0A0A0A",fontSize:"8px",padding:"2px 6px",borderRadius:"5px",fontWeight:800}}>HOT</span>}
                <span style={{fontSize:"18px"}}>{g.i}</span>
                <span style={{fontSize:"12px",fontWeight:600,color:text,fontFamily:"Cinzel,serif"}}>{g.n}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:"clamp(52px,6vw,88px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"48px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00D4FF",marginBottom:"10px",fontWeight:700}}>Why WaveTCG</div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(22px,4vw,44px)",fontWeight:700,color:text,marginBottom:"12px"}}>Built for Collectors</h2>
          <p style={{fontSize:"16px",color:muted,maxWidth:"480px",margin:"0 auto",lineHeight:1.8}}>Everything you need to trade TCG cards safely, instantly, and on-chain.</p>
        </div>
        <div className="feat-grid" style={{display:"grid",gap:"16px"}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card" style={{["--fc" as any]:f.c}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:`${f.c}12`,border:`1.5px solid ${f.c}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",marginBottom:"18px"}}>{f.icon}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"15px",fontWeight:700,color:text,marginBottom:"8px"}}>{f.t}</div>
              <p style={{fontSize:"13px",color:muted,lineHeight:1.85,margin:0}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{padding:"clamp(52px,6vw,80px) clamp(20px,5vw,60px)",background:surfaceBg,borderTop:`1px solid ${border}`}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"48px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00D4FF",marginBottom:"10px",fontWeight:700}}>Simple Process</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(22px,4vw,44px)",fontWeight:700,color:text,margin:0}}>How It Works</h2>
          </div>
          <div className="steps-grid" style={{display:"grid",gap:"14px"}}>
            {STEPS.map((s,i)=>(
              <div key={i} className="step-card">
                <div className="step-num-bg">{s.n}</div>
                <div style={{fontSize:"36px",marginBottom:"16px"}}>{s.icon}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 10px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:"20px",marginBottom:"12px"}}>
                  <span style={{fontSize:"9px",color:"#00D4FF",fontWeight:700,letterSpacing:"0.12em"}}>STEP {s.n}</span>
                </div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:"14px",fontWeight:700,color:text,marginBottom:"8px"}}>{s.t}</div>
                <p style={{fontSize:"13px",color:muted,lineHeight:1.8,margin:0}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI ORACLE */}
      <section style={{padding:"clamp(52px,6vw,88px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{background:darkMode?"linear-gradient(160deg,#1F2937,#111827)":"linear-gradient(160deg,#F0F4FF,#FAF9FF)",border:`1px solid ${darkMode?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.15)"}`,borderRadius:"20px",padding:"clamp(32px,5vw,64px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-60px",right:"-60px",width:"400px",height:"400px",background:"radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 65%)",pointerEvents:"none"}} />
          <div className="oracle-layout" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"48px",alignItems:"center",position:"relative",zIndex:1}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 14px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:"50px",marginBottom:"20px"}}>
                <span style={{fontSize:"13px"}}>🤖</span>
                <span style={{fontSize:"10px",color:"#7C3AED",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Claude AI Powered</span>
              </div>
              <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:700,color:text,marginBottom:"16px",lineHeight:1.15}}>Your Personal TCG Expert</h2>
              <p style={{fontSize:"15px",color:muted,lineHeight:1.85,marginBottom:"28px"}}>Ask anything about any TCG card — prices, fake detection, rulings, investment advice, deck recommendations.</p>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"28px"}}>
                {["💬 What is Gear 5 Luffy OP05-119 worth?","💬 Is my 1st Edition Charizard real?","💬 Best OPTCG deck for beginners?"].map((q,i)=>(
                  <div key={i} style={{padding:"9px 14px",background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.12)",borderRadius:"8px",fontSize:"13px",color:muted,fontStyle:"italic"}}>{q}</div>
                ))}
              </div>
              <a href="/oracle" className="btn-purple">Try AI Oracle Free →</a>
            </div>
            <div style={{background:darkMode?"#0d0d1a":"#F8FAFF",border:`1px solid ${darkMode?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.15)"}`,borderRadius:"14px",padding:"20px",fontFamily:"ui-monospace,monospace"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",paddingBottom:"12px",borderBottom:`1px solid ${border}`}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00D4FF",animation:"pulse 2s infinite"}} />
                <span style={{fontSize:"11px",color:muted,letterSpacing:"0.06em"}}>WaveTCG Oracle · Online</span>
              </div>
              <div style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.12)",borderRadius:"10px",padding:"11px 14px",marginBottom:"10px",marginLeft:"15%"}}>
                <p style={{margin:0,fontSize:"12px",color:muted,lineHeight:1.7}}>What is Gear 5 Luffy OP05-119 worth?</p>
              </div>
              <div style={{background:darkMode?"rgba(0,212,255,0.05)":"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:"10px",padding:"11px 14px",marginBottom:"10px",marginRight:"15%"}}>
                <p style={{margin:0,fontSize:"12px",color:text,lineHeight:1.75}}>OP05-119 Luffy (Gear 5) SEC — Raw NM: $350–$420 · Alt Art: $1,200–$1,500 · Manga Rare: $3,500–$4,500 · PSA 10: $800–$1,100. High investment potential 📈</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"9px 13px",background:darkMode?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)",borderRadius:"8px",border:`1px solid ${border}`}}>
                <span style={{fontSize:"12px",color:muted,flex:1,opacity:0.6}}>Ask about any card...</span>
                <div style={{width:"2px",height:"13px",background:"#7C3AED",animation:"blink 1s infinite"}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"clamp(52px,6vw,80px) clamp(20px,5vw,60px)",background:surfaceBg,borderTop:`1px solid ${border}`}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00D4FF",marginBottom:"10px",fontWeight:700}}>Community</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(22px,4vw,44px)",fontWeight:700,color:text,margin:0}}>Collectors Love WaveTCG</h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gap:"16px"}}>
            {[
              {name:"0xShanks",av:"☠️",role:"One Piece Collector",text:"Sold my Gear 5 Luffy in 10 minutes. SUI hit my wallet instantly. Never going back to eBay."},
              {name:"PikachuTrader",av:"⚡",role:"Pokémon Investor",text:"The AI Oracle priced my 1st Ed Charizard PSA 9 at $4,200. Sold it the next day at exactly that price."},
              {name:"MagicMarket",av:"✨",role:"MTG Vendor",text:"Listed 50 cards in 20 minutes using the card scanner. Zero upfront fees. This is how trading should work."},
            ].map((t,i)=>(
              <div key={i} className="testi">
                <div style={{display:"flex",gap:"3px",marginBottom:"14px"}}>
                  {Array(5).fill("★").map((s,j)=><span key={j} style={{color:"#D4AF37",fontSize:"14px"}}>{s}</span>)}
                </div>
                <p style={{fontSize:"14px",color:muted,lineHeight:1.85,margin:"0 0 20px",fontStyle:"italic"}}>"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))`,border:`1.5px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{t.av}</div>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:700,color:text,display:"flex",alignItems:"center",gap:"6px"}}>
                      {t.name}
                      <span style={{fontSize:"9px",background:"rgba(0,212,255,0.1)",color:"#00D4FF",padding:"1px 6px",borderRadius:"4px",border:"1px solid rgba(0,212,255,0.2)",fontWeight:600}}>✓ Verified</span>
                    </div>
                    <div style={{fontSize:"11px",color:muted}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"clamp(64px,8vw,110px) clamp(20px,5vw,60px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(0,212,255,0.05) 0%,transparent 70%)",pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:"600px",margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 16px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:"50px",marginBottom:"24px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00D4FF",animation:"pulse 2s infinite",display:"inline-block"}} />
            <span style={{fontSize:"11px",color:"#00D4FF",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Free to Get Started</span>
          </div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(28px,5vw,58px)",fontWeight:900,color:text,marginBottom:"16px",lineHeight:1.05}}>Ready to Ride the Wave?</h2>
          <p style={{fontSize:"clamp(14px,2vw,17px)",color:muted,marginBottom:"40px",lineHeight:1.85}}>Join collectors trading TCG cards on-chain. Free to list, 1% when it sells.</p>
          <div className="cta-btns" style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/marketplace" className="btn-main">Start Trading →</a>
            <a href="/sell" className="btn-ghost">+ List a Card</a>
            <a href="/optcg" className="btn-ghost">☠️ Join Tournament</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:darkMode?"#080808":"#1F2937",color:"#F5F5F5",padding:"clamp(44px,5vw,64px) clamp(20px,5vw,60px) 24px"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div className="footer-layout" style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:"56px",marginBottom:"44px"}}>
            <div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"22px",fontWeight:900,background:"linear-gradient(135deg,#00D4FF,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"12px"}}>WAVE</div>
              <p style={{fontSize:"12px",color:"#94A3B8",lineHeight:1.9,marginBottom:"16px"}}>The Web3 TCG Marketplace built on Sui blockchain.</p>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"16px"}}>
                {["Free Listings","1% Fee","Sui Network","8 TCGs"].map(t=>(
                  <span key={t} style={{fontSize:"10px",padding:"3px 8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"4px",color:"#94A3B8"}}>{t}</span>
                ))}
              </div>
              <span style={{fontSize:"11px",color:"rgba(0,212,255,0.5)",fontWeight:600}}>⬡ Powered by Sui Blockchain</span>
            </div>
            <div className="footer-links" style={{display:"grid",gap:"24px"}}>
              {[
                {title:"Marketplace",links:[{l:"Browse Cards",h:"/marketplace"},{l:"List a Card",h:"/sell"},{l:"Price Checker",h:"/price-checker"},{l:"Alerts",h:"/alerts"},{l:"Card Scanner",h:"/scan"}]},
                {title:"Features",links:[{l:"AI Oracle",h:"/oracle"},{l:"Tournaments",h:"/optcg"},{l:"Deck Builder",h:"/deckbuilder"},{l:"Swap",h:"/swap"},{l:"Portfolio",h:"/dashboard?tab=Portfolio"}]},
                {title:"Account",links:[{l:"Dashboard",h:"/dashboard"},{l:"Orders",h:"/dashboard?tab=Orders"},{l:"Collectors",h:"/users"},{l:"Analytics",h:"/analytics"}]},
                {title:"Help",links:[{l:"Guide",h:"/guide"},{l:"FAQ",h:"/guide?tab=faq"},{l:"Download",h:"/download"}]},
              ].map((col,i)=>(
                <div key={i}>
                  <div style={{fontSize:"10px",fontWeight:700,color:"#00D4FF",textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:"14px"}}>{col.title}</div>
                  {col.links.map((lk,j)=>(
                    <a key={j} href={lk.h} style={{display:"block",fontSize:"12px",color:"#94A3B8",textDecoration:"none",marginBottom:"9px",transition:"color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.color="#00D4FF")} onMouseLeave={e=>(e.currentTarget.style.color="#94A3B8")}>{lk.l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"20px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"11px",color:"#4B5563"}}>© 2026 WaveTCG · Built on Sui Blockchain · Not affiliated with Bandai, Nintendo, WotC, or Konami</span>
            <span style={{fontSize:"11px",color:"#4B5563"}}>wavetcgmarket.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
