"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const HOT_CARDS = [
  { code:"OP05-119", name:"Monkey D. Luffy", set:"Awakening of the New Era", rarity:"SEC", price:"$380", sui:"407", color:"#7C3AED", tag:"Gear 5" },
  { code:"OP01-003", name:"Monkey D. Luffy", set:"Romance Dawn", rarity:"L", price:"$356", sui:"381", color:"#00E5FF", tag:"Leader" },
  { code:"OP02-001", name:"Edward Newgate", set:"Paramount War", rarity:"L", price:"$210", sui:"224", color:"#00E5FF", tag:"Whitebeard" },
  { code:"OP06-001", name:"Shanks", set:"Wings of the Captain", rarity:"L", price:"$145", sui:"155", color:"#D4AF37", tag:"Red-Haired" },
  { code:"OP04-090", name:"Monkey D. Luffy", set:"Kingdoms of Intrigue", rarity:"SR", price:"$89", sui:"95", color:"#00E5FF", tag:"Dressrosa" },
  { code:"OP01-001", name:"Roronoa Zoro", set:"Romance Dawn", rarity:"SR", price:"$65", sui:"69", color:"#00E5FF", tag:"Straw Hat" },
  { code:"OP07-109", name:"Monkey D. Luffy", set:"500 Years in Future", rarity:"SR", price:"$38", sui:"40", color:"#00E5FF", tag:"Egghead" },
  { code:"OP09-119", name:"Monkey D. Luffy", set:"Emperors in New World", rarity:"SEC", price:"$28", sui:"29", color:"#7C3AED", tag:"Emperor" },
];

const RARITY_COLORS:Record<string,string> = {
  SEC:"#D4AF37", SR:"#7C3AED", R:"#00E5FF", L:"#D4AF37", UC:"#94A3B8", C:"#4B5563", TR:"#D4AF37"
};

const FEATURES = [
  { icon:"🃏", t:"Free Listings", d:"List any card for free. Only 1% when it sells — automatically on-chain.", c:"#00E5FF" },
  { icon:"⚡", t:"Instant Settlement", d:"Sui blockchain settles in under a second. No waiting, no holds.", c:"#00E5FF" },
  { icon:"🤖", t:"AI Oracle", d:"Claude AI knows every TCG card ever made. Prices, rulings, deck advice.", c:"#7C3AED" },
  { icon:"🔒", t:"Zero Chargebacks", d:"Blockchain transactions are final. No buyer scams, ever.", c:"#D4AF37" },
  { icon:"📊", t:"Price Checker", d:"Real-time prices vs TCGPlayer, CardMarket, eBay in one view.", c:"#00E5FF" },
  { icon:"☠️", t:"OPTCG Tournaments", d:"Weekly Swiss tournaments with on-chain SUI prize pools.", c:"#7C3AED" },
];

const STEPS = [
  { n:"01", t:"Scan & List", d:"Photo + AI auto-identifies the card, set your price in USD", icon:"📷" },
  { n:"02", t:"Browse & Compare", d:"Search 8+ TCGs with AI search and real-time price comparison", icon:"🔍" },
  { n:"03", t:"Buy with SUI", d:"One-click purchase, 1% fee, instant on-chain transfer", icon:"⚡" },
  { n:"04", t:"Ship & Complete", d:"Coordinate securely via encrypted in-app messaging", icon:"📦" },
];

export default function Home() {
  const [stats, setStats] = useState({ listings:0, users:0 });
  const [suiPrice, setSuiPrice] = useState(0.934);
  const [imgError, setImgError] = useState<Record<string,boolean>>({});

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

  return (
    <div style={{background:"#0A0A0A",color:"#F5F5F5",fontFamily:"DM Sans,sans-serif",overflowX:"hidden"}}>
      <style>{`
        :root{--cyan:#00E5FF;--purple:#7C3AED;--gold:#D4AF37;--bg:#0A0A0A;--surface:#1F2937;--text:#F5F5F5;--muted:#94A3B8}
        *{box-sizing:border-box;margin:0;padding:0}

        @keyframes floatCard{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-16px) rotate(calc(var(--r,0deg)*0.5))}}
        @keyframes gradMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%) skewX(-15deg)}100%{transform:translateX(300%) skewX(-15deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,229,255,0.2)}50%{box-shadow:0 0 50px rgba(0,229,255,0.5)}}

        .fade-up{animation:fadeUp 0.7s ease both}

        /* Buttons */
        .btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--cyan);color:#0A0A0A;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 0.2s;letter-spacing:0.02em;padding:15px 32px;text-decoration:none}
        .btn-primary:hover{background:#33EEFF;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,229,255,0.4)}
        .btn-secondary{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text);border:1.5px solid rgba(245,245,245,0.2);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:14px 24px;text-decoration:none}
        .btn-secondary:hover{border-color:var(--cyan);color:var(--cyan)}
        .btn-purple{display:inline-flex;align-items:center;gap:8px;background:var(--purple);color:#F5F5F5;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:15px 32px;text-decoration:none}
        .btn-purple:hover{background:#8B5CF6;transform:translateY(-2px);box-shadow:0 12px 40px rgba(124,58,237,0.4)}

        /* Cards */
        .card-wrap{position:relative;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform 0.35s cubic-bezier(0.23,1,0.32,1),box-shadow 0.35s ease;background:var(--surface)}
        .card-wrap:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 30px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(0,229,255,0.15)}
        .card-wrap .card-shine{position:absolute;inset:0;background:linear-gradient(135deg,transparent 25%,rgba(255,255,255,0.08) 50%,transparent 75%);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:4}
        .card-wrap:hover .card-shine{opacity:1}
        .card-wrap .buy-btn{opacity:0;transform:translateY(5px);transition:all 0.25s}
        .card-wrap:hover .buy-btn{opacity:1;transform:translateY(0)}

        /* Feature cards */
        .feat{background:var(--surface);border:1px solid rgba(245,245,245,0.07);border-radius:16px;padding:28px;transition:all 0.3s;position:relative;overflow:hidden}
        .feat::after{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent-color,#00E5FF);opacity:0;transition:opacity 0.3s;border-radius:16px 16px 0 0}
        .feat:hover{border-color:rgba(0,229,255,0.2);transform:translateY(-4px)}
        .feat:hover::after{opacity:1}

        /* Step cards */
        .step{background:var(--surface);border:1px solid rgba(245,245,245,0.07);border-radius:16px;padding:32px 24px;text-align:center;transition:all 0.3s;position:relative;overflow:hidden}
        .step:hover{border-color:rgba(0,229,255,0.2);transform:translateY(-4px)}
        .step-num{position:absolute;bottom:-8px;right:8px;font-family:Cinzel,serif;font-size:72px;font-weight:900;color:rgba(245,245,245,0.04);line-height:1;pointer-events:none}

        /* Game chips */
        .game-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border:1.5px solid rgba(245,245,245,0.1);border-radius:50px;background:rgba(245,245,245,0.03);cursor:pointer;transition:all 0.2s;text-decoration:none;white-space:nowrap;position:relative}
        .game-chip:hover{border-color:var(--cyan);background:rgba(0,229,255,0.06);transform:translateY(-2px)}

        /* Testimonials */
        .testi{background:var(--surface);border:1px solid rgba(245,245,245,0.07);border-radius:16px;padding:28px;transition:all 0.3s}
        .testi:hover{border-color:rgba(0,229,255,0.15);transform:translateY(-4px)}

        /* Stat block */
        .stat{padding:28px 20px;text-align:center;background:#111111;position:relative;overflow:hidden}
        .stat::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(245,245,245,0.02),transparent);animation:shimmer 5s infinite}

        /* Section label */
        .sec-label{display:inline-flex;align-items:center;gap:6px;padding:"4px 12px";background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.2);border-radius:50px;font-size:10px;color:var(--cyan);font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:14px}

        /* Oracle chat */
        .chat-box{background:#111111;border:1px solid rgba(124,58,237,0.2);border-radius:16px;padding:20px;font-family:monospace}

        @media(max-width:768px){
          .float-bg{display:none!important}
          .hot-grid{grid-template-columns:1fr 1fr!important}
          .feat-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .testi-grid{grid-template-columns:1fr!important}
          .stats-row{grid-template-columns:1fr 1fr!important}
          .cta-row{flex-direction:column!important;align-items:stretch!important}
          .oracle-grid{grid-template-columns:1fr!important}
          .footer-cols{grid-template-columns:1fr 1fr!important}
          .footer-main{grid-template-columns:1fr!important;gap:32px!important}
        }
        @media(min-width:769px){
          .hot-grid{grid-template-columns:repeat(4,1fr)!important}
          .feat-grid{grid-template-columns:repeat(3,1fr)!important}
          .steps-grid{grid-template-columns:repeat(4,1fr)!important}
          .testi-grid{grid-template-columns:repeat(3,1fr)!important}
          .stats-row{grid-template-columns:repeat(5,1fr)!important}
          .footer-cols{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>

      {/* ════════════════════════════
          HERO
      ════════════════════════════ */}
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"clamp(100px,12vw,130px) clamp(20px,5vw,60px) clamp(60px,8vw,100px)",position:"relative",overflow:"hidden"}}>

        {/* Subtle grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.04) 1px,transparent 1px)",backgroundSize:"72px 72px",maskImage:"radial-gradient(ellipse 75% 75% at 50% 40%,black 30%,transparent 100%)",pointerEvents:"none"}} />

        {/* Glow blobs */}
        <div style={{position:"absolute",width:"700px",height:"700px",top:"50%",left:"50%",transform:"translate(-50%,-60%)",background:"radial-gradient(circle,rgba(0,229,255,0.07) 0%,transparent 60%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",width:"350px",height:"350px",top:"10%",left:"8%",background:"radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)",pointerEvents:"none",animation:"pulse 6s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:"300px",height:"300px",bottom:"15%",right:"8%",background:"radial-gradient(circle,rgba(0,229,255,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"pulse 6s ease-in-out infinite 3s"}} />

        {/* Floating cards */}
        <div className="float-bg" style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}}>
          {[
            {code:"OP05-119",x:"2%",y:"12%",r:"-9deg",del:"0s",sz:115,op:0.18},
            {code:"OP01-003",x:"80%",y:"6%",r:"7deg",del:"0.6s",sz:108,op:0.16},
            {code:"OP02-001",x:"86%",y:"52%",r:"-5deg",del:"1.1s",sz:100,op:0.13},
            {code:"OP06-001",x:"0%",y:"64%",r:"8deg",del:"1.6s",sz:104,op:0.16},
            {code:"OP04-090",x:"76%",y:"74%",r:"-6deg",del:"0.9s",sz:94,op:0.12},
            {code:"OP01-001",x:"4%",y:"78%",r:"5deg",del:"1.3s",sz:98,op:0.14},
          ].map((c,i) => (
            <div key={i} style={{position:"absolute",left:c.x,top:c.y,width:`${c.sz}px`,opacity:c.op,["--r" as any]:c.r,animation:`floatCard ${5.5+i*0.4}s ease-in-out infinite`,animationDelay:c.del,filter:"drop-shadow(0 24px 48px rgba(0,0,0,0.95)) drop-shadow(0 0 24px rgba(0,229,255,0.1))"}}>
              <img src={`https://optcgapi.com/media/static/Card_Images/${c.code}.jpg`} alt="" style={{width:"100%",borderRadius:"10px",display:"block"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{position:"relative",zIndex:10,maxWidth:"840px",width:"100%"}}>

          {/* Live badge */}
          <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"7px 18px",background:"rgba(0,229,255,0.08)",border:"1px solid rgba(0,229,255,0.25)",borderRadius:"50px",marginBottom:"36px",animationDelay:"0s"}}>
            <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00E5FF",display:"inline-block",animation:"glow 2s infinite",boxShadow:"0 0 10px rgba(0,229,255,0.8)"}} />
            <span style={{fontSize:"11px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#00E5FF",fontWeight:700}}>Live on Sui Mainnet</span>
            <span style={{width:"1px",height:"12px",background:"rgba(245,245,245,0.1)"}} />
            <span style={{fontSize:"11px",color:"var(--muted)"}}>SUI ${suiPrice.toFixed(3)}</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{fontFamily:"Cinzel,serif",fontSize:"clamp(40px,8vw,96px)",fontWeight:900,lineHeight:0.98,marginBottom:"24px",letterSpacing:"-0.025em",animationDelay:"0.1s"}}>
            <span style={{display:"block",color:"#F5F5F5"}}>Ride the Wave.</span>
            <span style={{display:"block",background:"linear-gradient(135deg,#00E5FF 0%,#7C3AED 50%,#D4AF37 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"300% 300%",animation:"gradMove 6s ease infinite"}}>Trade Any Card.</span>
          </h1>

          {/* Sub */}
          <p className="fade-up" style={{fontSize:"clamp(15px,2.2vw,19px)",color:"var(--muted)",lineHeight:1.85,marginBottom:"44px",maxWidth:"580px",margin:"0 auto 44px",fontWeight:300,animationDelay:"0.2s"}}>
            Buy, sell & collect <strong style={{color:"#F5F5F5",fontWeight:600}}>One Piece, Pokémon, Magic, Yu-Gi-Oh!</strong> and more. Free listings, 1% fee, instant Sui settlement.
          </p>

          {/* CTAs */}
          <div className="cta-row fade-up" style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",marginBottom:"56px",animationDelay:"0.3s"}}>
            <a href="/marketplace" className="btn-primary">🃏 Browse Marketplace</a>
            <a href="/sell" className="btn-secondary">+ List a Card</a>
            <a href="/scan" className="btn-secondary">📷 Scan Card</a>
            <a href="/oracle" className="btn-secondary">🤖 AI Oracle</a>
          </div>

          {/* Trust */}
          <div className="fade-up" style={{display:"flex",gap:"24px",justifyContent:"center",flexWrap:"wrap",animationDelay:"0.4s"}}>
            {["✓ Free to list","✓ 1% fee only","✓ Instant settlement","✓ 8 TCG games","✓ AI-powered"].map(b => (
              <span key={b} style={{fontSize:"12px",color:"rgba(148,163,184,0.5)",letterSpacing:"0.04em"}}>{b}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{position:"absolute",bottom:"28px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",opacity:0.2,pointerEvents:"none"}}>
          <span style={{fontSize:"9px",letterSpacing:"0.2em",textTransform:"uppercase",color:"#F5F5F5"}}>Scroll</span>
          <div style={{width:"1px",height:"44px",background:"linear-gradient(to bottom,#F5F5F5,transparent)"}} />
        </div>
      </section>

      {/* ════════════════════════════
          STATS
      ════════════════════════════ */}
      <div style={{background:"#111111",borderTop:"1px solid rgba(245,245,245,0.06)",borderBottom:"1px solid rgba(245,245,245,0.06)"}}>
        <div className="stats-row" style={{maxWidth:"1280px",margin:"0 auto",display:"grid",background:"rgba(245,245,245,0.02)"}}>
          {[
            {v:stats.listings>0?stats.listings.toLocaleString():"0",l:"Active Listings",c:"#00E5FF",i:"🃏"},
            {v:stats.users>0?stats.users.toLocaleString():"0",l:"Collectors",c:"#00E5FF",i:"👥"},
            {v:"1%",l:"Platform Fee",c:"#D4AF37",i:"⚡"},
            {v:`$${suiPrice.toFixed(3)}`,l:"SUI Price",c:"#7C3AED",i:"💎"},
            {v:"8+",l:"TCG Games",c:"#00E5FF",i:"🎮"},
          ].map((s,i) => (
            <div key={i} className="stat" style={{borderLeft:i>0?"1px solid rgba(245,245,245,0.05)":"none"}}>
              <div style={{fontSize:"18px",marginBottom:"10px"}}>{s.i}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"clamp(26px,3.5vw,40px)",fontWeight:800,color:s.c,marginBottom:"6px",letterSpacing:"-0.02em"}}>{s.v}</div>
              <div style={{fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--muted)",fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════
          HOT CARDS
      ════════════════════════════ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"36px",flexWrap:"wrap",gap:"14px"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"7px",padding:"4px 14px",background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:"20px",marginBottom:"12px"}}>
              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#D4AF37",display:"inline-block",animation:"pulse 1.5s infinite"}} />
              <span style={{fontSize:"10px",color:"#D4AF37",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Live Market</span>
            </div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,46px)",fontWeight:700,color:"#F5F5F5",margin:0,letterSpacing:"-0.01em"}}>Trending Cards</h2>
          </div>
          <a href="/marketplace" style={{textDecoration:"none",fontSize:"12px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid rgba(0,229,255,0.2)",padding:"9px 20px",borderRadius:"8px",transition:"all 0.2s",display:"inline-block"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,229,255,0.06)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>View All →</a>
        </div>

        <div className="hot-grid" style={{display:"grid",gap:"14px"}}>
          {HOT_CARDS.map((card,i) => (
            <a key={i} href="/marketplace" style={{textDecoration:"none"}}>
              <div className="card-wrap">
                {/* Rarity top line */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${RARITY_COLORS[card.rarity]||"#00E5FF"},transparent)`,zIndex:3}} />
                <div className="card-shine" />

                {/* Image */}
                <div style={{width:"100%",aspectRatio:"3/4",overflow:"hidden",background:`linear-gradient(160deg,${card.color}18,#1F2937)`,position:"relative"}}>
                  {!imgError[card.code] ? (
                    <img
                      src={`https://optcgapi.com/media/static/Card_Images/${card.code}.jpg`}
                      alt={card.name}
                      style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s ease"}}
                      onError={()=>setImgError(p=>({...p,[card.code]:true}))}
                    />
                  ) : (
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"10px",padding:"20px"}}>
                      <span style={{fontSize:"32px"}}>🃏</span>
                      <span style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--muted)",textAlign:"center",lineHeight:1.4}}>{card.name}</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{position:"absolute",top:"10px",left:"10px",zIndex:4}}>
                    <span style={{fontSize:"9px",fontWeight:800,padding:"3px 8px",borderRadius:"5px",background:`${RARITY_COLORS[card.rarity]||"#00E5FF"}20`,color:RARITY_COLORS[card.rarity]||"#00E5FF",border:`1px solid ${RARITY_COLORS[card.rarity]||"#00E5FF"}50`,letterSpacing:"0.1em"}}>{card.rarity}</span>
                  </div>
                  <div style={{position:"absolute",top:"10px",right:"10px",zIndex:4}}>
                    <span style={{fontSize:"9px",padding:"3px 8px",borderRadius:"5px",background:"rgba(0,0,0,0.65)",color:"rgba(245,245,245,0.5)",backdropFilter:"blur(4px)"}}>{card.tag}</span>
                  </div>

                  {/* Hover overlay */}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,10,10,0.6) 0%,transparent 60%)",zIndex:2}} />
                </div>

                {/* Info */}
                <div style={{padding:"14px 16px 16px",background:"#1F2937"}}>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:700,color:"#F5F5F5",marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
                  <div style={{fontSize:"10px",color:"var(--muted)",marginBottom:"12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.set}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <span style={{fontFamily:"Cinzel,serif",fontSize:"18px",fontWeight:800,color:"#F5F5F5"}}>{card.price}</span>
                    <span style={{fontSize:"10px",color:"var(--muted)"}}>{card.sui} SUI</span>
                  </div>
                  <button className="buy-btn" style={{width:"100%",background:"var(--cyan)",color:"#0A0A0A",border:"none",padding:"10px",borderRadius:"8px",fontSize:"12px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.04em"}}>Buy Now →</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════
          GAMES
      ════════════════════════════ */}
      <section style={{padding:"clamp(40px,5vw,72px) clamp(20px,5vw,60px)",background:"#111111",borderTop:"1px solid rgba(245,245,245,0.05)",borderBottom:"1px solid rgba(245,245,245,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"32px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--cyan)",marginBottom:"10px",fontWeight:700}}>8 Supported Games</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(20px,3.5vw,36px)",fontWeight:700,color:"#F5F5F5",margin:0}}>All Your Favorite TCGs</h2>
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
                {g.hot && <span style={{position:"absolute",top:"-7px",right:"-5px",background:"linear-gradient(135deg,#D4AF37,#EAB308)",color:"#0A0A0A",fontSize:"8px",padding:"2px 6px",borderRadius:"6px",fontWeight:800,letterSpacing:"0.08em"}}>HOT</span>}
                <span style={{fontSize:"20px"}}>{g.i}</span>
                <span style={{fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:600,color:"#F5F5F5"}}>{g.n}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          FEATURES
      ════════════════════════════ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"56px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--cyan)",marginBottom:"12px",fontWeight:700}}>Why WaveTCG</div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,48px)",fontWeight:700,color:"#F5F5F5",marginBottom:"14px",letterSpacing:"-0.01em"}}>Built for Serious Collectors</h2>
          <p style={{fontSize:"16px",color:"var(--muted)",maxWidth:"500px",margin:"0 auto",lineHeight:1.85}}>Everything you need to trade physical TCG cards safely, instantly, and on-chain.</p>
        </div>
        <div className="feat-grid" style={{display:"grid",gap:"16px"}}>
          {FEATURES.map((f,i) => (
            <div key={i} className="feat" style={{["--accent-color" as any]:f.c}}>
              <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`${f.c}12`,border:`1px solid ${f.c}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",marginBottom:"20px"}}>{f.icon}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"15px",fontWeight:700,color:"#F5F5F5",marginBottom:"10px"}}>{f.t}</div>
              <p style={{fontSize:"13px",color:"var(--muted)",lineHeight:1.9,margin:0}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════
          HOW IT WORKS
      ════════════════════════════ */}
      <section style={{padding:"clamp(56px,6vw,88px) clamp(20px,5vw,60px)",background:"#111111",borderTop:"1px solid rgba(245,245,245,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"56px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--cyan)",marginBottom:"12px",fontWeight:700}}>Simple Process</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4.5vw,48px)",fontWeight:700,color:"#F5F5F5",margin:0,letterSpacing:"-0.01em"}}>How It Works</h2>
          </div>
          <div className="steps-grid" style={{display:"grid",gap:"16px"}}>
            {STEPS.map((s,i) => (
              <div key={i} className="step">
                <div className="step-num">{s.n}</div>
                <div style={{fontSize:"40px",marginBottom:"20px"}}>{s.icon}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"3px 10px",background:"rgba(0,229,255,0.07)",border:"1px solid rgba(0,229,255,0.18)",borderRadius:"20px",marginBottom:"14px"}}>
                  <span style={{fontSize:"9px",color:"var(--cyan)",fontWeight:700,letterSpacing:"0.14em"}}>STEP {s.n}</span>
                </div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:"15px",fontWeight:700,color:"#F5F5F5",marginBottom:"10px"}}>{s.t}</div>
                <p style={{fontSize:"13px",color:"var(--muted)",lineHeight:1.85,margin:0}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          AI ORACLE
      ════════════════════════════ */}
      <section style={{padding:"clamp(56px,7vw,100px) clamp(20px,5vw,60px)",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{background:"linear-gradient(160deg,#1F2937,#111827)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:"24px",padding:"clamp(36px,5vw,72px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-80px",right:"-80px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 65%)",pointerEvents:"none"}} />

          <div className="oracle-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"56px",alignItems:"center",position:"relative",zIndex:1}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 14px",background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:"50px",marginBottom:"24px"}}>
                <span style={{fontSize:"14px"}}>🤖</span>
                <span style={{fontSize:"10px",color:"#8B5CF6",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Powered by Claude AI</span>
              </div>
              <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:700,color:"#F5F5F5",marginBottom:"18px",lineHeight:1.12}}>Your Personal TCG Expert</h2>
              <p style={{fontSize:"15px",color:"var(--muted)",lineHeight:1.9,marginBottom:"32px"}}>Ask anything about any card from any TCG. Prices, rulings, investment outlook, fake detection, deck advice — Claude AI knows it all.</p>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"32px"}}>
                {[
                  "💬 What is Gear 5 Luffy OP05-119 worth graded PSA 10?",
                  "💬 Is my 1st Edition Charizard real or fake?",
                  "💬 Best counter to the current OPTCG meta?",
                ].map((q,i) => (
                  <div key={i} style={{padding:"10px 16px",background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.14)",borderRadius:"8px",fontSize:"13px",color:"var(--muted)",fontStyle:"italic"}}>{q}</div>
                ))}
              </div>
              <a href="/oracle" className="btn-purple">Try AI Oracle Free →</a>
            </div>

            {/* Chat demo */}
            <div className="chat-box">
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px",paddingBottom:"12px",borderBottom:"1px solid rgba(245,245,245,0.06)"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00E5FF",boxShadow:"0 0 8px rgba(0,229,255,0.8)",animation:"pulse 2s infinite"}} />
                <span style={{fontSize:"11px",color:"var(--muted)",letterSpacing:"0.08em"}}>WaveTCG Oracle · Online</span>
              </div>
              <div style={{background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.14)",borderRadius:"10px",padding:"12px 14px",marginBottom:"10px",marginLeft:"20%"}}>
                <p style={{margin:0,fontSize:"12px",color:"rgba(245,245,245,0.7)",lineHeight:1.7}}>What is Gear 5 Luffy OP05-119 worth?</p>
              </div>
              <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.12)",borderRadius:"10px",padding:"12px 14px",marginBottom:"10px",marginRight:"20%"}}>
                <p style={{margin:0,fontSize:"12px",color:"rgba(245,245,245,0.85)",lineHeight:1.75,whiteSpace:"pre-line"}}>{"Monkey D. Luffy OP05-119 SEC\n\n📊 Market Value:\n• Raw NM: $350-$420\n• Alt Art: $1,200-$1,500\n• Manga Rare: $3,500-$4,500\n• PSA 10: $800-$1,100\n\n📈 High investment potential."}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 14px",background:"rgba(245,245,245,0.03)",borderRadius:"8px",border:"1px solid rgba(245,245,245,0.07)"}}>
                <span style={{fontSize:"12px",color:"rgba(148,163,184,0.4)",flex:1}}>Ask about any card...</span>
                <div style={{width:"2px",height:"14px",background:"var(--purple)",animation:"blink 1s infinite"}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          TESTIMONIALS
      ════════════════════════════ */}
      <section style={{padding:"clamp(56px,6vw,88px) clamp(20px,5vw,60px)",background:"#111111",borderTop:"1px solid rgba(245,245,245,0.05)"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"52px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--cyan)",marginBottom:"12px",fontWeight:700}}>Community</div>
            <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(24px,4vw,46px)",fontWeight:700,color:"#F5F5F5",margin:0,letterSpacing:"-0.01em"}}>Collectors Love WaveTCG</h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gap:"16px"}}>
            {[
              {name:"0xShanks",av:"☠️",role:"One Piece Collector",text:"Sold my Gear 5 Luffy in 10 minutes. Payment hit my wallet instantly. Never going back to eBay fees and chargebacks."},
              {name:"PikachuTrader",av:"⚡",role:"Pokémon Investor",text:"The AI Oracle told me my 1st Ed Charizard PSA 9 was worth $4,200. Sold it the next day at that exact price."},
              {name:"MagicMarket",av:"✨",role:"MTG Vendor",text:"Listed 50 cards in 20 minutes using the card scanner. Zero fees until they sell. This is how card trading should work."},
            ].map((t,i) => (
              <div key={i} className="testi">
                <div style={{display:"flex",gap:"3px",marginBottom:"16px"}}>
                  {Array(5).fill("★").map((s,j)=><span key={j} style={{color:"#D4AF37",fontSize:"13px"}}>{s}</span>)}
                </div>
                <p style={{fontSize:"14px",color:"var(--muted)",lineHeight:1.9,margin:"0 0 22px",fontStyle:"italic"}}>"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"42px",height:"42px",borderRadius:"50%",background:"linear-gradient(135deg,#00E5FF20,#7C3AED20)",border:"1px solid rgba(0,229,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{t.av}</div>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:700,color:"#F5F5F5",display:"flex",alignItems:"center",gap:"6px"}}>
                      {t.name}
                      <span style={{fontSize:"9px",background:"rgba(0,229,255,0.08)",color:"var(--cyan)",padding:"1px 6px",borderRadius:"4px",border:"1px solid rgba(0,229,255,0.2)",fontWeight:600}}>✓ Verified</span>
                    </div>
                    <div style={{fontSize:"11px",color:"var(--muted)"}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          FINAL CTA
      ════════════════════════════ */}
      <section style={{padding:"clamp(72px,9vw,130px) clamp(20px,5vw,60px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 65% 55% at 50% 50%,rgba(0,229,255,0.05) 0%,transparent 70%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)",backgroundSize:"72px 72px",maskImage:"radial-gradient(ellipse 55% 55% at 50% 50%,black 0%,transparent 100%)",pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:"640px",margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 18px",background:"rgba(0,229,255,0.07)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:"50px",marginBottom:"26px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00E5FF",animation:"glow 2s infinite",display:"inline-block"}} />
            <span style={{fontSize:"11px",color:"var(--cyan)",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase"}}>Live on Sui Mainnet</span>
          </div>
          <h2 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(30px,5.5vw,64px)",fontWeight:900,color:"#F5F5F5",marginBottom:"18px",lineHeight:1.02,letterSpacing:"-0.025em"}}>Ready to Ride<br/>the Wave?</h2>
          <p style={{fontSize:"clamp(14px,2vw,17px)",color:"var(--muted)",marginBottom:"44px",fontWeight:300,lineHeight:1.85}}>Join collectors trading TCG cards on-chain. Free to list, 1% when it sells, instant payment.</p>
          <div className="cta-row" style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/marketplace" className="btn-primary">Start Trading →</a>
            <a href="/sell" className="btn-secondary">+ List a Card</a>
            <a href="/optcg" className="btn-secondary">☠️ Join Tournament</a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          FOOTER
      ════════════════════════════ */}
      <footer style={{background:"#080808",borderTop:"1px solid rgba(245,245,245,0.06)",padding:"clamp(48px,5vw,72px) clamp(20px,5vw,60px) 28px"}}>
        <div style={{maxWidth:"1280px",margin:"0 auto"}}>
          <div className="footer-main" style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:"64px",marginBottom:"52px"}}>
            <div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:"24px",fontWeight:900,background:"linear-gradient(135deg,#00E5FF,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"14px",letterSpacing:"0.04em"}}>WAVE</div>
              <p style={{fontSize:"12px",color:"var(--muted)",lineHeight:1.95,marginBottom:"20px",opacity:0.7}}>The Web3 TCG Marketplace built on Sui blockchain. Free listings, 1% fee, instant settlement.</p>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"20px"}}>
                {["Free Listings","1% Fee","Sui Network","8 TCGs"].map(t=>(
                  <span key={t} style={{fontSize:"10px",padding:"3px 8px",background:"rgba(245,245,245,0.04)",border:"1px solid rgba(245,245,245,0.08)",borderRadius:"4px",color:"var(--muted)",opacity:0.7}}>{t}</span>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"11px",color:"var(--muted)",opacity:0.5}}>Powered by</span>
                <span style={{fontSize:"11px",fontWeight:700,color:"rgba(0,229,255,0.5)",letterSpacing:"0.04em"}}>⬡ Sui Blockchain</span>
              </div>
            </div>
            <div className="footer-cols" style={{display:"grid",gap:"24px"}}>
              {[
                {title:"Marketplace",links:[{l:"Browse Cards",h:"/marketplace"},{l:"List a Card",h:"/sell"},{l:"Price Checker",h:"/price-checker"},{l:"Alerts",h:"/alerts"},{l:"Card Scanner",h:"/scan"}]},
                {title:"Features",links:[{l:"AI Oracle",h:"/oracle"},{l:"Tournaments",h:"/optcg"},{l:"Deck Builder",h:"/deckbuilder"},{l:"Swap",h:"/swap"},{l:"Portfolio",h:"/dashboard?tab=Portfolio"}]},
                {title:"Account",links:[{l:"Dashboard",h:"/dashboard"},{l:"Orders",h:"/dashboard?tab=Orders"},{l:"Collectors",h:"/users"},{l:"Analytics",h:"/analytics"}]},
                {title:"Help",links:[{l:"Guide",h:"/guide"},{l:"FAQ",h:"/guide?tab=faq"},{l:"Download",h:"/download"}]},
              ].map((col,i)=>(
                <div key={i}>
                  <div style={{fontSize:"10px",fontWeight:700,color:"var(--cyan)",textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:"16px"}}>{col.title}</div>
                  {col.links.map((lk,j)=>(
                    <a key={j} href={lk.h} style={{display:"block",fontSize:"12px",color:"var(--muted)",textDecoration:"none",marginBottom:"10px",transition:"color 0.15s",opacity:0.7}} onMouseEnter={e=>{e.currentTarget.style.color="var(--cyan)";e.currentTarget.style.opacity="1"}} onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.opacity="0.7"}}>{lk.l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(245,245,245,0.06)",paddingTop:"22px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",alignItems:"center"}}>
            <span style={{fontSize:"11px",color:"var(--muted)",opacity:0.35}}>© 2026 WaveTCG · Built on Sui Blockchain · Not affiliated with Bandai, Nintendo, Wizards of the Coast, or Konami</span>
            <span style={{fontSize:"11px",color:"var(--muted)",opacity:0.35}}>wavetcgmarket.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
