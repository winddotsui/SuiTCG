"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const HOT_CARDS = [
  { code:"OP05-119", name:"Monkey D. Luffy", set:"Awakening of the New Era", rarity:"SEC", price:"$380", sui:"407", color:"#a855f7", tag:"Gear 5" },
  { code:"OP01-003", name:"Monkey D. Luffy", set:"Romance Dawn", rarity:"L", price:"$356", sui:"381", color:"#0099ff", tag:"Leader" },
  { code:"OP02-001", name:"Edward Newgate", set:"Paramount War", rarity:"L", price:"$210", sui:"224", color:"#00d4ff", tag:"Whitebeard" },
  { code:"OP06-001", name:"Shanks", set:"Wings of the Captain", rarity:"L", price:"$145", sui:"155", color:"#ff6b6b", tag:"Red-Haired" },
  { code:"OP04-090", name:"Monkey D. Luffy", set:"Kingdoms of Intrigue", rarity:"SR", price:"$89", sui:"95", color:"#00ff88", tag:"Dressrosa" },
  { code:"OP01-001", name:"Roronoa Zoro", set:"Romance Dawn", rarity:"SR", price:"$65", sui:"69", color:"#22c55e", tag:"Straw Hat" },
  { code:"OP07-109", name:"Monkey D. Luffy", set:"500 Years in Future", rarity:"SR", price:"$38", sui:"40", color:"#f59e0b", tag:"Egghead" },
  { code:"OP09-119", name:"Monkey D. Luffy", set:"Emperors in New World", rarity:"SEC", price:"$28", sui:"29", color:"#ec4899", tag:"Emperor" },
];

const RARITY_COLORS: Record<string,string> = {
  SEC:"#a855f7", SR:"#0099ff", R:"#00ff88", L:"#f59e0b", UC:"#6b7280", C:"#374151", TR:"#ff6b6b"
};

const FEATURES = [
  { icon:"🃏", t:"Free Listings", d:"List any card for free. Pay only 1% when it sells — automatically on-chain.", c:"#0099ff" },
  { icon:"⚡", t:"Sub-Second Trades", d:"Sui blockchain settles instantly. No 3-5 day payment holds like PayPal.", c:"#00d4ff" },
  { icon:"🤖", t:"AI Oracle", d:"Claude AI knows every card ever made. Prices, rulings, deck advice.", c:"#a855f7" },
  { icon:"🔒", t:"Zero Chargebacks", d:"Blockchain is final. No buyer scams, no payment reversals, ever.", c:"#00ff88" },
  { icon:"📊", t:"Price Checker", d:"Compare real-time vs TCGPlayer, CardMarket, eBay in one click.", c:"#f59e0b" },
  { icon:"☠️", t:"OPTCG Tournaments", d:"Weekly Swiss tournaments with on-chain SUI prizes. Register now.", c:"#ff6b6b" },
];

const STEPS = [
  { n:"01", t:"Scan & List", d:"Snap a photo, AI identifies the card, set your price in USD", icon:"📷" },
  { n:"02", t:"Browse & Discover", d:"Search 8+ TCGs with filters, AI search, and price comparison", icon:"🔍" },
  { n:"03", t:"Buy with SUI", d:"One-click purchase, 1% fee split automatically on-chain", icon:"⚡" },
  { n:"04", t:"Ship & Confirm", d:"Coordinate securely via encrypted in-app chat", icon:"📦" },
];

export default function Home() {
  const [stats, setStats] = useState({ listings:0, users:0 });
  const [suiPrice, setSuiPrice] = useState(0.934);
  const [imgLoaded, setImgLoaded] = useState<Record<string,boolean>>({});
  const [tick, setTick] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x+1), 60000);
    fetchStats();
    fetch("/api/sui-price").then(r=>r.json()).then(d=>setSuiPrice(d.price||0.934)).catch(()=>{});
    return () => clearInterval(t);
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

  return (
    <div style={{background:"#000008",color:"#fff",fontFamily:"DM Sans,sans-serif",overflowX:"hidden"}}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes floatY{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-18px) rotate(calc(var(--r)*0.6))}}
        @keyframes waveText{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes shimmer{0%{left:-100%}100%{left:200%}}
        @keyframes scanAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(100% - 3px))}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px var(--gc,rgba(0,153,255,0.3))}50%{box-shadow:0 0 50px var(--gc,rgba(0,153,255,0.6))}}
        @keyframes rotate{to{transform:rotate(360deg)}}

        .fade-up{animation:fadeUp 0.7s ease both}
        .slide-in{animation:slideIn 0.5s ease both}

        .card3d{position:relative;transition:transform 0.35s cubic-bezier(0.23,1,0.32,1),box-shadow 0.35s ease;transform-style:preserve-3d;cursor:pointer;border-radius:14px;overflow:hidden}
        .card3d:hover{transform:translateY(-10px) scale(1.03) rotateY(3deg);box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 30px rgba(0,153,255,0.15)}
        .card3d .shine{position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:5}
        .card3d:hover .shine{opacity:1}
        .card3d .buy-btn{opacity:0;transform:translateY(6px);transition:all 0.25s}
        .card3d:hover .buy-btn{opacity:1;transform:translateY(0)}

        .btn-cta{background:linear-gradient(135deg,#0044ee,#0099ff);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.25s;position:relative;overflow:hidden;letter-spacing:0.02em;display:inline-flex;align-items:center;gap:8px}
        .btn-cta:hover{transform:translateY(-2px);box-shadow:0 16px 48px rgba(0,100,255,0.5)}
        .btn-cta::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);opacity:0;transition:opacity 0.2s}
        .btn-cta:hover::after{opacity:1}
        .btn-outline{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12);border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
        .btn-outline:hover{border-color:rgba(255,255,255,0.28);color:#fff;background:rgba(255,255,255,0.08)}

        .feat-card{background:#060616;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px;transition:all 0.3s;position:relative;overflow:hidden}
        .feat-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:var(--fc,#0099ff);opacity:0;transition:opacity 0.3s;border-radius:18px 18px 0 0}
        .feat-card:hover{border-color:rgba(0,153,255,0.2);transform:translateY(-5px);background:#07071a}
        .feat-card:hover::before{opacity:1}

        .step-card{background:linear-gradient(160deg,#060616,#080824);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:32px 24px;text-align:center;position:relative;overflow:hidden;transition:all 0.3s}
        .step-card:hover{border-color:rgba(0,153,255,0.2);transform:translateY(-5px)}
        .step-num{position:absolute;bottom:-10px;right:10px;font-family:Cinzel,serif;font-size:80px;font-weight:900;color:rgba(255,255,255,0.025);line-height:1;pointer-events:none;user-select:none}

        .testi-card{background:#060616;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px;transition:all 0.3s}
        .testi-card:hover{border-color:rgba(0,153,255,0.15);transform:translateY(-4px)}

        .game-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid rgba(255,255,255,0.08);border-radius:50px;background:rgba(255,255,255,0.02);cursor:pointer;transition:all 0.2s;text-decoration:none;white-space:nowrap;position:relative}
        .game-chip:hover{border-color:rgba(0,153,255,0.4);background:rgba(0,153,255,0.07);transform:translateY(-3px)}

        .stat-block{padding:28px 20px;text-align:center;background:#030312;position:relative;overflow:hidden}
        .stat-block::after{content:"";position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.025),transparent);animation:shimmer 4s infinite}

        .rarity-glow{position:absolute;top:0;left:0;right:0;height:3px;border-radius:14px 14px 0 0}

        .oracle-chat{background:#000010;border:1px solid rgba(168,85,247,0.2);border-radius:16px;padding:20px;font-family:monospace}
        .chat-bubble{border-radius:12px;padding:12px 16px;font-size:12.5px;line-height:1.75;margin-bottom:12px}
        .cursor-blink{display:inline-block;width:2px;height:14px;background:#a855f7;margin-left:2px;animation:blink 1s infinite;vertical-align:middle}

        @media(max-width:768px){
          .float-cards{display:none!important}
          .hot-grid{grid-template-columns:1fr 1fr!important}
          .feat-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .testi-grid{grid-template-columns:1fr!important}
          .footer-cols{grid-template-columns:1fr 1fr!important}
          .footer-wrap{grid-template-columns:1fr!important;gap:32px!important}
          .oracle-grid{grid-template-columns:1fr!important}
          .cta-row{flex-direction:column!important;align-items:stretch!important}
          .cta-row a,cta-row button{width:100%!important;text-align:center!important;justify-content:center!important}
          .stats-strip{grid-template-columns:1fr 1fr!important}
        }
        @media(min-width:769px){
          .hot-grid{grid-template-columns:repeat(4,1fr)!important}
          .feat-grid{grid-template-columns:repeat(3,1fr)!important}
          .steps-grid{grid-template-columns:repeat(4,1fr)!important}
          .testi-grid{grid-template-columns:repeat(3,1fr)!important}
          .stats-strip{grid-template-columns:repeat(5,1fr)!important}
          .footer-cols{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"clamp(100px,14vw,130px) clamp(20px,5vw,60px) clamp(60px,8vw,100px)",position:"relative",overflow:"hidden"}}>

        {/* Grid bg */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,153,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,153,255,0.04) 1px,transparent 1px)",backgroundSize:"64px 64px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)",pointerEvents:"none"}} />

        {/* Glow orbs */}
        <div style={{position:"absolute",width:"800px",height:"800px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"radial-gradient(circle,rgba(0,60,220,0.1) 0%,transparent 65%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",width:"400px",height:"400px",top:"5%",left:"5%",background:"radial-gradient(circle,rgba(0,100,255,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"pulse 5s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:"360px",height:"360px",top:"5%",right:"5%",background:"radial-gradient(circle,rgba(168,85,247,0.06) 0%,transparent 70%)",pointerEvents:"none",animation:"pulse 5s ease-in-out infinite 2.5s"}} />

        {/* Floating cards */}
        <div className="float-cards" style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}}>
          {[
            {code:"OP05-119",x:"2%",y:"12%",r:"-8deg",del:"0s",sz:115,op:0.22},
            {code:"OP01-003",x:"80%",y:"6%",r:"7deg",del:"0.6s",sz:105,op:0.2},
            {code:"OP02-001",x:"86%",y:"50%",r:"-5deg",del:"1.1s",sz:98,op:0.16},
            {code:"OP06-001",x:"0%",y:"62%",r:"8deg",del:"1.6s",sz:102,op:0.2},
            {code:"OP04-090",x:"76%",y:"72%",r:"-6deg",del:"0.9s",sz:92,op:0.14},
            {code:"OP01-001",x:"5%",y:"76%",r:"5deg",del:"1.3s",sz:96,op:0.17},
          ].map((c,i) => (
            <div key={i} style={{position:"absolute",left:c.x,top:c.y,width:`${c.sz}px`,opacity:c.op,["--r" as any]:c.r,animation:`floatY ${5.5+i*0.4}s ease-in-out infinite`,animationDelay:c.del,filter:"drop-shadow(0 20px 40px rgba(0,0,0,0.95)) drop-shadow(0 0 20px rgba(0,100,255,0.15))"}}>
              <img src={`https://en.onepiece-cardgame.com/images/cardlist/card/${c.code}.png`} alt="" style={{width:"100%",borderRadius:"10px",display:"block"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{position:"relative",zIndex:10,maxWidth:"820px",width:"100%"}}>

          {/* Live badge */}
          <div className="slide-in" style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"7px 18px",background:"linear-gradient(135deg,rgba(0,255,136,0.07),rgba(0,153,255,0.07))",border:"1px solid rgba(0,255,136,0.2)",borderRadius:"50px",marginBottom:"32px",backdropFilter:"blur(10px)"}}>
            <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00ff88",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 8px #00ff88"}} />
            <span style={{fontSize:"11px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#00ff88",fontWeight:700}}>Live on Sui Mainnet</span>
            <span style={{width:"1px",height:"12px",background:"rgba(255,255,255,0.1)"}} />
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>SUI ${suiPrice.toFixed(3)}</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{fontFamily:"Cinzel,serif",fontSize:"clamp(42px,8.5vw,100px)",fontWeight:900,lineHeight:0.98,marginBottom:"22px",letterSpacing:"-0.025em",animationDelay:"0.1s"}}>
            <span style={{display:"block",color:"#ffffff",textShadow:"0 0 80px rgba(0,100,255,0.2)"}}>Ride the Wave.</span>
            <span style={{display:"block",background:"linear-gradient(135deg,#0044ff 0%,#0099ff 30%,#00d4ff 60%,#00ffcc 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"300% 300%",animation:"waveText 5s ease infinite"}}>Trade Any Card.</span>
          </h1>

          {/* Sub */}
          <p className="fade-up" style={{fontSize:"clamp(15px,2.2vw,19px)",color:"rgba(255,255,255,0.4)",lineHeight:1.85,marginBottom:"42px",maxWidth:"580px",margin:"0 auto 42px",fontWeight:300,animationDelay:"0.2s"}}>
            Buy, sell & collect <strong style={{color:"rgba(255,255,255,0.75)",fontWeight:500}}>One Piece, Pokémon, Magic: The Gathering, Yu-Gi-Oh!</strong> and more on Sui blockchain.
          </p>

          {/* CTAs */}
          <div className="cta-row fade-up" style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",marginBottom:"52px",animationDelay:"0.3s"}}>
            <a href="/marketplace" style={{textDecoration:"none"}}>
              <button className="btn-cta" style={{padding:"18px 36px",fontSize:"15px"}}>
                🃏 Browse Marketplace
              </button>
            </a>
            <a href="/sell" style={{textDecoration:"none"}}>
              <button className="btn-outline" style={{padding:"17px 28px"}}>
                + List a Card
              </button>
            </a>
            <a href="/scan" style={{textDecoration:"none"}}>
              <button className="btn-outline" style={{padding:"17px 28px"}}>
                📷 Scan Card
              </button>
            </a>
            <a href="/oracle" style={{textDecoration:"none"}}>
              <button className="btn-outline" style={{padding:"17px 28px"}}>
                🤖 AI Oracle
              </button>
            </a>
          </div>

          {/* Trust row */}
          <div className="fade-up" style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap",animationDelay:"0.4s"}}>
            {["✓ Free to list","✓ 1% fee only","✓ Instant settlement","✓ 8 TCG games","✓ AI-powered"].map(b => (
              <span key={b} style={{fontSize:"12px",color:"rgba(255,255,255,0.2)",letterSpacing:"0.04em"}}>{b}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:"28px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",opacity:0.2,pointerEvents:"none"}}>
          <span style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase"}}>Explore</span>
          <div style={{width:"1px",height:"48px",background:"linear-gradient(to bottom,rgba(255,255,255,0.8),transparent)"}} />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LIVE STATS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{background:"#030312",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="stats-strip" style={{maxWidth:"1280px",margin:"0 auto",display:"grid",background:"rgba(255,255,255,0.03)"}}>
          {[
            {v:stats.listings>0?stats.listings.toLocaleString():"0",l:"Active Listings",c:"#0099ff",i:"🃏"},
            {v:stats.users>0?stats.users.toLocaleString():"0",l:"Collectors",c:"#00d4ff",i:"👥"},
            {v:"1%",l:"Platform Fee",c:"#00ff88",i:"⚡"},
            {v:`$${suiPrice.toFixed(3)}`,l:"SUI Price",c:"#a855f7",i:"💎"},
            {v:"8+",l:"TCG Games",c:"#f59e0b",i:"🎮"},
          ].map((s,i) => (
            <div key={i} className="stat-block" style={{borderLeft:i>0?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <div style={{fontSize:"18px",marginBottom:"8px"}}>{s.i}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,3.5vw,38px)",fontWeight:800,color:s.c,marginBottom:"6px",letterSpacing:"-0.02em"}}>{s.v}</div>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.18)",fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOT CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"36px",flexWrap:"wrap",gap:"14px"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"7px",padding:"4px 12px",background:"rgba(255,80,0,0.07)",border:"1px solid rgba(255,100,0,0.2)",borderRadius:"20px",marginBottom:"12px"}}>
              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#ff6600",display:"inline-block",animation:"blink 1.5s infinite",boxShadow:"0 0 6px #ff6600"}} />
              <span style={{fontSize:"10px",color:"#ff9944",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Live Market Prices</span>
            </div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,44px)",fontWeight:700,color:"#fff",margin:0,letterSpacing:"-0.01em"}}>Trending Cards</h2>
          </div>
          <a href="/marketplace" style={{textDecoration:"none",fontSize:"12px",color:"#0099ff",letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid rgba(0,153,255,0.2)",padding:"9px 20px",borderRadius:"8px",transition:"all 0.2s",display:"inline-block"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,153,255,0.07)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>View All →</a>
        </div>

        <div className="hot-grid" style={{display:"grid",gap:"14px"}}>
          {HOT_CARDS.map((card,i) => (
            <a key={i} href="/marketplace" style={{textDecoration:"none"}}>
              <div className="card3d" style={{background:"#060616",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="shine" />
                <div className="rarity-glow" style={{background:`linear-gradient(90deg,transparent,${RARITY_COLORS[card.rarity]||"#0099ff"},transparent)`}} />

                {/* Image */}
                <div style={{width:"100%",aspectRatio:"3/4",overflow:"hidden",background:`linear-gradient(160deg,${card.color}12,#050515)`,position:"relative"}}>
                  <img
                    src={`https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`}
                    alt={card.name}
                    style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s ease",display:imgLoaded[card.code]===false?"none":"block"}}
                    onLoad={()=>setImgLoaded(p=>({...p,[card.code]:true}))}
                    onError={()=>setImgLoaded(p=>({...p,[card.code]:false}))}
                  />
                  {imgLoaded[card.code]===false && (
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"8px",padding:"16px",textAlign:"center"}}>
                      <span style={{fontSize:"28px"}}>🃏</span>
                      <span style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"rgba(255,255,255,0.3)",lineHeight:1.4}}>{card.name}</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{position:"absolute",top:"8px",left:"8px",zIndex:3}}>
                    <span style={{fontSize:"9px",fontWeight:700,padding:"3px 7px",borderRadius:"5px",background:`${RARITY_COLORS[card.rarity]||"#0099ff"}25`,color:RARITY_COLORS[card.rarity]||"#0099ff",border:`1px solid ${RARITY_COLORS[card.rarity]||"#0099ff"}40`,letterSpacing:"0.08em"}}>{card.rarity}</span>
                  </div>
                  <div style={{position:"absolute",top:"8px",right:"8px",zIndex:3}}>
                    <span style={{fontSize:"9px",padding:"3px 7px",borderRadius:"5px",background:"rgba(0,0,0,0.6)",color:"rgba(255,255,255,0.5)",backdropFilter:"blur(4px)"}}>{card.tag}</span>
                  </div>
                </div>

                {/* Info */}
                <div style={{padding:"12px 14px 14px"}}>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:700,color:"#fff",marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
                  <div style={{fontSize:"10px",color:"rgba(255,255,255,0.22)",marginBottom:"10px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.set}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <span style={{fontFamily:"Cinzel,serif",fontSize:"16px",fontWeight:800,color:"#fff"}}>{card.price}</span>
                    <span style={{fontSize:"10px",color:"rgba(255,255,255,0.25)"}}>{card.sui} SUI</span>
                  </div>
                  <button className="buy-btn" style={{width:"100%",background:"linear-gradient(135deg,#0044ee,#0099ff)",color:"#fff",border:"none",padding:"9px",borderRadius:"8px",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.04em"}}>Buy Now →</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GAMES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(40px,5vw,72px) clamp(20px,5vw,60px)",background:"#030312",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"32px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#0099ff",marginBottom:"8px",fontWeight:600}}>8 Supported Games</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(20px,3.5vw,36px)",fontWeight:700,color:"#fff",margin:0}}>All Your Favorite TCGs</h2>
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
            ].map((g,i) => (
              <a key={i} href={g.h} className="game-chip" style={{textDecoration:"none"}}>
                {g.hot && <span style={{position:"absolute",top:"-7px",right:"-5px",background:"linear-gradient(135deg,#ff4400,#ff6600)",color:"#fff",fontSize:"8px",padding:"1px 6px",borderRadius:"6px",fontWeight:800,letterSpacing:"0.08em",boxShadow:"0 2px 8px rgba(255,100,0,0.4)"}}>HOT</span>}
                <span style={{fontSize:"20px"}}>{g.i}</span>
                <span style={{fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{g.n}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"52px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#0099ff",marginBottom:"10px",fontWeight:600}}>Why WaveTCG</div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,46px)",fontWeight:700,color:"#fff",marginBottom:"14px",letterSpacing:"-0.01em"}}>Built for Serious Collectors</h2>
          <p style={{fontSize:"15px",color:"rgba(255,255,255,0.28)",maxWidth:"500px",margin:"0 auto",lineHeight:1.8}}>Everything you need to trade physical TCG cards safely and instantly on the blockchain.</p>
        </div>
        <div className="feat-grid" style={{display:"grid",gap:"16px"}}>
          {FEATURES.map((f,i) => (
            <div key={i} className="feat-card" style={{["--fc" as any]:f.c}}>
              <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`${f.c}14`,border:`1px solid ${f.c}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",marginBottom:"20px"}}>{f.icon}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"15px",fontWeight:700,color:"#fff",marginBottom:"10px"}}>{f.t}</div>
              <p style={{fontSize:"13px",color:"rgba(255,255,255,0.32)",lineHeight:1.85,margin:0}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW IT WORKS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(56px,6vw,88px) clamp(20px,5vw,60px)",background:"#030312",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"52px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#0099ff",marginBottom:"10px",fontWeight:600}}>Simple Process</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,46px)",fontWeight:700,color:"#fff",margin:0,letterSpacing:"-0.01em"}}>How It Works</h2>
          </div>
          <div className="steps-grid" style={{display:"grid",gap:"16px"}}>
            {STEPS.map((s,i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.n}</div>
                <div style={{fontSize:"40px",marginBottom:"18px"}}>{s.icon}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"3px 10px",background:"rgba(0,153,255,0.07)",border:"1px solid rgba(0,153,255,0.15)",borderRadius:"20px",marginBottom:"14px"}}>
                  <span style={{fontSize:"9px",color:"#0099ff",fontWeight:700,letterSpacing:"0.12em"}}>STEP {s.n}</span>
                </div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:"15px",fontWeight:700,color:"#fff",marginBottom:"10px"}}>{s.t}</div>
                <p style={{fontSize:"13px",color:"rgba(255,255,255,0.32)",lineHeight:1.8,margin:0}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          AI ORACLE TEASER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{background:"linear-gradient(160deg,#060616,#090924)",border:"1px solid rgba(168,85,247,0.15)",borderRadius:"24px",padding:"clamp(36px,5vw,72px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 65%)",pointerEvents:"none"}} />
          <div style={{position:"absolute",bottom:"-80px",left:"-80px",width:"400px",height:"400px",background:"radial-gradient(circle,rgba(0,100,255,0.05) 0%,transparent 65%)",pointerEvents:"none"}} />

          <div className="oracle-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"56px",alignItems:"center",position:"relative",zIndex:1}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 14px",background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.25)",borderRadius:"50px",marginBottom:"22px"}}>
                <span style={{fontSize:"14px"}}>🤖</span>
                <span style={{fontSize:"10px",color:"#c084fc",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Powered by Claude AI</span>
              </div>
              <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:700,color:"#fff",marginBottom:"18px",lineHeight:1.12,letterSpacing:"-0.01em"}}>Your Personal TCG Expert</h2>
              <p style={{fontSize:"15px",color:"rgba(255,255,255,0.38)",lineHeight:1.85,marginBottom:"32px"}}>Ask anything about any card from any TCG. Prices, rulings, investment outlook, deck builds, fake detection — Claude AI knows it all.</p>
              <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"32px"}}>
                {["💬 What is Gear 5 Luffy OP05-119 worth graded PSA 10?","💬 Is my 1st Edition Charizard real or fake?","💬 Best counter to the current OPTCG meta?"].map((q,i) => (
                  <div key={i} style={{padding:"10px 16px",background:"rgba(168,85,247,0.05)",border:"1px solid rgba(168,85,247,0.12)",borderRadius:"8px",fontSize:"13px",color:"rgba(255,255,255,0.5)",fontStyle:"italic"}}>{q}</div>
                ))}
              </div>
              <a href="/oracle" style={{textDecoration:"none"}}>
                <button className="btn-cta" style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)",padding:"16px 32px",fontSize:"14px"}}>
                  Try AI Oracle Free →
                </button>
              </a>
            </div>

            {/* Chat demo */}
            <div className="oracle-chat">
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px",paddingBottom:"12px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88",animation:"pulse 2s infinite"}} />
                <span style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>WaveTCG Oracle · Online</span>
              </div>
              {[
                {r:"user",t:"What is Gear 5 Luffy OP05-119 worth?"},
                {r:"ai",t:"Monkey D. Luffy OP05-119 (Gear 5) — SEC

📊 Current Market Value:
• Raw NM: $350 – $420
• Alt Art (p1): $1,200 – $1,500
• Manga Rare (p2): $3,500 – $4,500
• PSA 10: $800 – $1,100

📈 High investment potential — one of the most iconic cards in OPTCG history."},
              ].map((m,i) => (
                <div key={i} className="chat-bubble" style={{background:m.r==="user"?"rgba(0,153,255,0.06)":"rgba(168,85,247,0.06)",border:`1px solid ${m.r==="user"?"rgba(0,153,255,0.12)":"rgba(168,85,247,0.12)"}`,color:m.r==="user"?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.82)",whiteSpace:"pre-line",textAlign:m.r==="user"?"right":"left",marginLeft:m.r==="user"?"20%":"0",marginRight:m.r==="user"?"0":"20%"}}>
                  {m.t}
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.06)"}}>
                <span style={{fontSize:"12px",color:"rgba(255,255,255,0.18)",flex:1}}>Ask about any card...</span>
                <div className="cursor-blink" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TESTIMONIALS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(56px,6vw,88px) clamp(20px,5vw,60px)",background:"#030312",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"48px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#0099ff",marginBottom:"10px",fontWeight:600}}>Community</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:"#fff",margin:0,letterSpacing:"-0.01em"}}>Collectors Love WaveTCG</h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gap:"16px"}}>
            {[
              {name:"0xShanks",av:"☠️",role:"One Piece Collector",text:"Sold my Gear 5 Luffy in 10 minutes. Payment hit my wallet instantly. Never going back to eBay fees and chargebacks.",stars:5},
              {name:"PikachuTrader",av:"⚡",role:"Pokémon Investor",text:"The AI Oracle told me my 1st Ed Charizard PSA 9 was worth $4,200. Sold it the next day at that exact price. Insane.",stars:5},
              {name:"MagicMarket",av:"✨",role:"MTG Vendor",text:"Listed 50 cards in 20 minutes using the card scanner. Zero fees until they sell. This is how card trading should work.",stars:5},
            ].map((t,i) => (
              <div key={i} className="testi-card">
                <div style={{display:"flex",gap:"4px",marginBottom:"16px"}}>
                  {Array(t.stars).fill("★").map((s,j)=><span key={j} style={{color:"#f59e0b",fontSize:"13px"}}>{s}</span>)}
                </div>
                <p style={{fontSize:"14px",color:"rgba(255,255,255,0.5)",lineHeight:1.85,margin:"0 0 20px",fontStyle:"italic"}}>"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"linear-gradient(135deg,#0044ee,#0099ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{t.av}</div>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:"6px"}}>
                      {t.name}
                      <span style={{fontSize:"9px",background:"rgba(0,153,255,0.1)",color:"#0099ff",padding:"1px 6px",borderRadius:"4px",border:"1px solid rgba(0,153,255,0.2)",fontWeight:600}}>✓ Verified</span>
                    </div>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.25)"}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FINAL CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"clamp(72px,9vw,130px) clamp(20px,5vw,60px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(0,60,220,0.08) 0%,transparent 70%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,153,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,153,255,0.03) 1px,transparent 1px)",backgroundSize:"64px 64px",maskImage:"radial-gradient(ellipse 60% 60% at 50% 50%,black 0%,transparent 100%)",pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:"640px",margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 16px",background:"rgba(0,255,136,0.07)",border:"1px solid rgba(0,255,136,0.18)",borderRadius:"50px",marginBottom:"24px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",animation:"pulse 2s infinite",boxShadow:"0 0 8px #00ff88",display:"inline-block"}} />
            <span style={{fontSize:"11px",color:"#00ff88",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Live on Sui Mainnet</span>
          </div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(30px,5.5vw,62px)",fontWeight:900,color:"#fff",marginBottom:"16px",lineHeight:1.05,letterSpacing:"-0.02em"}}>Ready to Ride<br/>the Wave?</h2>
          <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,0.28)",marginBottom:"40px",fontWeight:300,lineHeight:1.8}}>Join collectors trading TCG cards on-chain. Free to list, 1% when it sells, instant payment.</p>
          <div className="cta-row" style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/marketplace" style={{textDecoration:"none"}}><button className="btn-cta" style={{padding:"18px 44px",fontSize:"15px"}}>Start Trading →</button></a>
            <a href="/sell" style={{textDecoration:"none"}}><button className="btn-outline" style={{padding:"17px 28px"}}>+ List a Card</button></a>
            <a href="/optcg" style={{textDecoration:"none"}}><button className="btn-outline" style={{padding:"17px 28px"}}>☠️ Join Tournament</button></a>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{background:"#020210",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"clamp(48px,5vw,72px) clamp(20px,5vw,60px) 28px"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div className="footer-wrap" style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:"60px",marginBottom:"48px"}}>
            <div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"24px",fontWeight:900,background:"linear-gradient(135deg,#0044ff,#0099ff,#00d4ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"14px",letterSpacing:"0.04em"}}>WAVE</div>
              <p style={{fontSize:"12px",color:"rgba(255,255,255,0.18)",lineHeight:1.9,marginBottom:"20px"}}>The Web3 TCG Marketplace built on Sui blockchain. Free listings, 1% fee, instant settlement.</p>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"20px"}}>
                {["Free Listings","1% Fee","Sui Network","8 TCGs"].map(t=>(
                  <span key={t} style={{fontSize:"10px",padding:"3px 8px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"4px",color:"rgba(255,255,255,0.2)"}}>{t}</span>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"11px",color:"rgba(255,255,255,0.15)"}}>Powered by</span>
                <span style={{fontSize:"12px",fontWeight:700,color:"rgba(0,153,255,0.4)",letterSpacing:"0.04em"}}>⬡ Sui Blockchain</span>
              </div>
            </div>
            <div className="footer-cols" style={{display:"grid",gap:"24px"}}>
              {[
                {title:"Marketplace",links:[{l:"Browse Cards",h:"/marketplace"},{l:"List a Card",h:"/sell"},{l:"Price Checker",h:"/price-checker"},{l:"Alerts",h:"/alerts"},{l:"Card Scanner",h:"/scan"}]},
                {title:"Features",links:[{l:"AI Oracle",h:"/oracle"},{l:"Tournaments",h:"/optcg"},{l:"Deck Builder",h:"/deckbuilder"},{l:"Swap",h:"/swap"},{l:"Portfolio",h:"/dashboard?tab=Portfolio"}]},
                {title:"Account",links:[{l:"Dashboard",h:"/dashboard"},{l:"Orders",h:"/dashboard?tab=Orders"},{l:"Collectors",h:"/users"},{l:"Analytics",h:"/analytics"}]},
                {title:"Help",links:[{l:"Guide",h:"/guide"},{l:"FAQ",h:"/guide?tab=faq"},{l:"Download",h:"/download"},{l:"About",h:"/guide"}]},
              ].map((col,i)=>(
                <div key={i}>
                  <div style={{fontSize:"10px",fontWeight:700,color:"#0099ff",textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:"16px"}}>{col.title}</div>
                  {col.links.map((lk,j)=>(
                    <a key={j} href={lk.h} style={{display:"block",fontSize:"12px",color:"rgba(255,255,255,0.2)",textDecoration:"none",marginBottom:"10px",transition:"color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.color="#0099ff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.2)")}>{lk.l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:"22px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",alignItems:"center"}}>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.1)"}}>© 2026 WaveTCG · Built on Sui Blockchain · Not affiliated with Bandai, Nintendo, Wizards of the Coast, or Konami</span>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.1)"}}>wavetcgmarket.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
