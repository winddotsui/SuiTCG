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
  { icon:"⚡", t:"Instant Payment", d:"Sui blockchain settles in under a second. Get paid the moment your card sells.", c:"#7C3AED" },
  { icon:"🤖", t:"AI Card Oracle", d:"Claude AI identifies any card, gives real prices, rulings, and deck advice.", c:"#D4AF37" },
  { icon:"🔒", t:"Zero Chargebacks", d:"On-chain payments are final. No payment reversals or buyer fraud.", c:"#00D4FF" },
  { icon:"📊", t:"Price Comparison", d:"See WaveTCG vs TCGPlayer vs CardMarket prices side by side.", c:"#7C3AED" },
  { icon:"☠️", t:"OPTCG Tournaments", d:"Weekly Swiss bracket events with on-chain SUI prize pools.", c:"#D4AF37" },
];

const STEPS = [
  { n:"1", t:"Scan Your Card", d:"Take a photo — AI identifies it instantly and fills in all details", icon:"📷" },
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

  const bg = darkMode ? "#111111" : "#FFFFED";
  const surface = darkMode ? "#1F2937" : "#FFFFFF";
  const text = darkMode ? "#F5F5F5" : "#1F2937";
  const muted = darkMode ? "#94A3B8" : "#64748B";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const surfaceBg = darkMode ? "#1a1a2e" : "#F1F5F9";

  return (
    <div style={{background:bg,color:text,fontFamily:"DM Sans,sans-serif",overflowX:"hidden",transition:"background 0.3s,color 0.3s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-14px) rotate(calc(var(--r,0deg)*0.4))}}
        @keyframes shine{0%{left:-100%}100%{left:200%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

        .fade-up{animation:fadeUp 0.6s ease both}

        .card-item{background:${surface};border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 0.3s cubic-bezier(0.23,1,0.32,1),box-shadow 0.3s ease;position:relative;border:1px solid ${border}}
        .card-item:hover{transform:translateY(-8px) scale(1.02);box-shadow:${darkMode?"0 20px 60px rgba(0,0,0,0.8)":"0 20px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(0,212,255,0.15)"}}
        .card-item .card-overlay{position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:3}
        .card-item:hover .card-overlay{opacity:1}
        .card-item .buy-now{opacity:0;transform:translateY(4px);transition:all 0.2s}
        .card-item:hover .buy-now{opacity:1;transform:translateY(0)}

        .btn-main{display:inline-flex;align-items:center;gap:8px;background:#00D4FF;color:#0A0A0A;border:none;border-radius:8px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 0.2s;padding:14px 28px;text-decoration:none;letter-spacing:0.01em}
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
        .step-card:hover{border-color:#00D4FF;transform:translateY(-3px);box-shadow:${darkMode?"0 12px 40px rgba(0,0,0,0.5)":"0 12px 40px rgba(0,0,0,0.08)"}}
        .step-num-bg{position:absolute;bottom:-10px;right:8px;font-size:80px;font-weight:900;color:${darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};line-height:1;pointer-events:none;font-family:Georgia,serif}

        .game-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1.5px solid ${border};border-radius:50px;background:${surface};cursor:pointer;transition:all 0.2s;text-decoration:none;white-space:nowrap;position:relative}
        .game-pill:hover{border-color:#00D4FF;box-shadow:0 4px 16px rgba(0,212,255,0.12);transform:translateY(-2px)}

        .testi{background:${surface};border:1px solid ${border};border-radius:14px;padding:28px;transition:all 0.25s}
        .testi:hover{border-color:rgba(0,212,255,0.3);box-shadow:${darkMode?"0 8px 32px rgba(0,0,0,0.4)":"0 8px 32px rgba(0,0,0,0.06)"}}

        .stat-block{padding:28px 20px;text-align:center;background:${surface};border-right:1px solid ${border}}
        .stat-block:last-child{border-right:none}

        .section-label{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:20px;font-size:10px;color:#00D4FF;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px}

        .chat-demo{background:${darkMode?"#0d0d1a":"#F8FAFF"};border:1px solid ${darkMode?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.15)"};border-radius:14px;padding:20px;font-family:ui-monospace,monospace}

        .dark-toggle{background:${darkMode?"#374151":"#F3F4F6"};border:1.5px solid ${border};border-radius:50px;padding:4px 6px;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s;font-size:14px}

        @media(max-width:768px){
          .float-cards-bg{display:none!important}
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

      {/* ═══════ DARK MODE TOGGLE (fixed) ═══════ */}
      <div style={{position:"fixed",bottom:"24px",right:"24px",zIndex:1000}}>
        <button className="dark-toggle" onClick={()=>{ const d=!darkMode; setDarkMode(d); document.body.classList.toggle("dark-mode",d); }} title="Toggle dark mode">
          {darkMode ? "☀️" : "🌙"}
          <span style={{fontSize:"11px",color:muted,fontFamily:"DM Sans,sans-serif"}}>{darkMode?"Light":"Dark"}</span>
        </button>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section style={{minHeight:"92vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"clamp(100px,12vw,130px) clamp(20px,5vw,60px) clamp(60px,7vw,90px)",position:"relative",overflow:"hidden",background:darkMode?"#0d0d1a":bg}}>

        {/* Subtle grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${darkMode?"rgba(0,212,255,0.04)":"rgba(0,212,255,0.06)"} 1px,transparent 1px),linear-gradient(90deg,${darkMode?"rgba(0,212,255,0.04)":"rgba(0,212,255,0.06)"} 1px,transparent 1px)`,backgroundSize:"80px 80px",maskImage:"radial-gradient(ellipse 70% 70% at 50% 40%,black 20%,transparent 100%)",pointerEvents:"none"}} />

        {/* Glow */}
        <div style={{position:"absolute",width:"600px",height:"400px",top:"30%",left:"50%",transform:"translate(-50%,-50%)",background:`radial-gradient(ellipse,${darkMode?"rgba(0,212,255,0.06)":"rgba(0,212,255,0.07)"} 0%,transparent 65%)`,pointerEvents:"none"}} />

        {/* Floating cards */}
