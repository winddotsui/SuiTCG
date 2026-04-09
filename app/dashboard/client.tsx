"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { showSuccess, showError } from "../../lib/toast";

const COLORS = ["#0099ff","#00d4ff","#00ff88","#a78bfa","#ffcc00","#ff6b6b","#f472b6","#34d399","#fb923c","#60a5fa"];
const TABS = ["Overview","Portfolio","Listings","Orders","Alerts","Decks","Tournaments"];

interface TokenHolding {
  coinType: string; symbol: string; name: string; iconUrl: string | null;
  balance: number; decimals: number; price: number | null; value: number | null; pct: number;
}

function fmt(n: number, d = 2) { return n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}); }
function shortAddr(addr: string) { return addr ? addr.slice(0,6)+"..."+addr.slice(-4) : "—"; }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#0a1628",border:"1px solid rgba(0,153,255,0.25)",borderRadius:"10px",padding:"10px 16px"}}>
      <div style={{fontSize:"13px",fontWeight:700,color:"#fff",marginBottom:"4px"}}>{payload[0].name}</div>
      <div style={{fontSize:"12px",color:"#00d4ff"}}>${fmt(payload[0].value)}</div>
      <div style={{fontSize:"11px",color:"#8899bb"}}>{fmt(payload[0].payload.pct)}% of portfolio</div>
    </div>
  );
};

function DashboardInner() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username:"", bio:"", twitter:"", discord:"", telegram:"", avatar_url:"", email:"" });
  const [sortBy, setSortBy] = useState<"value"|"balance"|"symbol">("value");

  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const addr = account?.address || (typeof window !== "undefined" ? localStorage.getItem("wavetcg_wallet_address") || "" : "");
    setWalletAddress(addr);
  }, [account?.address]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TABS.includes(tabParam)) setTab(tabParam);
  }, [searchParams]);

  useEffect(() => { if (walletAddress) { fetchAll(); fetchPortfolio(); } else setLoading(false); }, [walletAddress]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [profileRes, listingsRes, ordersRes, alertsRes, decksRes, tournamentsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("wallet_address", walletAddress).single(),
        supabase.from("listings").select("*").eq("seller_address", walletAddress).order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").or(`seller_address.eq.${walletAddress},buyer_address.eq.${walletAddress}`).order("created_at", { ascending: false }),
        supabase.from("price_alerts").select("*").eq("user_wallet", walletAddress).order("created_at", { ascending: false }),
        supabase.from("saved_decks").select("*").eq("wallet_address", walletAddress).order("created_at", { ascending: false }),
        supabase.from("tournament_registrations").select("*").eq("wallet_address", walletAddress).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) { setProfile(profileRes.data); setForm({ username: profileRes.data.username||"", bio: profileRes.data.bio||"", twitter: profileRes.data.twitter||"", discord: profileRes.data.discord||"", telegram: profileRes.data.telegram||"", avatar_url: profileRes.data.avatar_url||"", email: profileRes.data.email||"" }); }
      if (listingsRes.data) setListings(listingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (decksRes.data) setDecks(decksRes.data);
      if (tournamentsRes.data) setTournaments(tournamentsRes.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) return;
    setPortfolioLoading(true);
    try {
      const balances = await client.getAllBalances({ owner: walletAddress });
      const holdingsRaw: TokenHolding[] = await Promise.all(balances.map(async (b) => {
        let symbol = b.coinType.split("::").pop() || "?";
        let name = symbol, decimals = 9, iconUrl = null;
        try {
          const meta = await client.getCoinMetadata({ coinType: b.coinType });
          if (meta) { symbol = meta.symbol||symbol; name = meta.name||name; decimals = meta.decimals??9; iconUrl = meta.iconUrl||null; }
        } catch {}
        const balance = Number(b.totalBalance) / 10**decimals;
        return { coinType:b.coinType, symbol, name, iconUrl, balance, decimals, price:null, value:null, pct:0 };
      }));
      let prices: Record<string,number> = {};
      try {
        const res = await fetch("/api/token-prices", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ coinTypes: holdingsRaw.map(h => h.coinType) }) });
        if (res.ok) { const data = await res.json(); Object.assign(prices, data.prices||{}); }
      } catch {}
      const withPrices = holdingsRaw.map(h => {
        const price = prices[h.coinType] ?? null;
        return { ...h, price, value: price !== null ? h.balance * price : null };
      });
      const totalValue = withPrices.reduce((s,h) => s + (h.value||0), 0);
      const final = withPrices.map(h => ({ ...h, pct: totalValue > 0 && h.value ? (h.value/totalValue)*100 : 0 }))
        .sort((a,b) => (b.value||0) - (a.value||0));
      setHoldings(final);
    } catch(e) { console.error(e); }
    setPortfolioLoading(false);
  }, [walletAddress, client]);

  async function saveProfile() {
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({ wallet_address: walletAddress, ...form }, { onConflict: "wallet_address" });
      await fetchAll();
      setEditing(false);
      showSuccess("Profile saved!");
    } catch { showError("Failed to save"); }
    setSaving(false);
  }

  async function deleteListing(id: string) {
    await supabase.from("listings").delete().eq("id", id);
    setListings(prev => prev.filter(l => l.id !== id));
    showSuccess("Listing deleted");
  }

  async function deleteAlert(id: string) {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    showSuccess("Alert deleted");
  }

  const totalValue = holdings.reduce((s,h) => s + (h.value||0), 0);
  const pieData = holdings.filter(h => h.value && h.value > 0).map(h => ({ name: h.symbol, value: h.value!, pct: h.pct }));
  const sorted = [...holdings].sort((a,b) => sortBy==="value"?(b.value||0)-(a.value||0):sortBy==="balance"?b.balance-a.balance:a.symbol.localeCompare(b.symbol));

  const inp = { width:"100%", background:"#0a1628", border:"1px solid rgba(0,153,255,0.15)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#fff", fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box" as const };
  const lbl = { display:"block", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase" as const, color:"#8899bb", marginBottom:"6px" };

  if (!walletAddress) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"16px"}}>
      <div style={{fontSize:"48px"}}>🔐</div>
      <div style={{fontFamily:"Cinzel, serif",fontSize:"20px",color:"#fff"}}>Connect your wallet</div>
      <p style={{color:"#8899bb",fontSize:"14px"}}>Connect your Sui wallet to view your dashboard</p>
    </div>
  );

  if (loading) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"40px",height:"40px",border:"3px solid rgba(0,153,255,0.2)",borderTopColor:"#0099ff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#000008",color:"#fff",fontFamily:"DM Sans, sans-serif",padding:"32px clamp(16px,4vw,48px) 80px"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .tab-btn{background:none;border:none;cursor:pointer;padding:10px 18px;font-size:13px;font-weight:500;border-radius:8px;transition:all 0.15s;font-family:DM Sans,sans-serif;white-space:nowrap}
        .tab-btn:hover{background:rgba(255,255,255,0.05);color:#fff}
        .tab-btn.active{background:rgba(0,153,255,0.12);color:#0099ff;border:1px solid rgba(0,153,255,0.2)}
        .tok-row:hover{background:rgba(255,255,255,0.02)}
        .action-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;transition:all 0.15s}
        .action-btn:hover{border-color:rgba(255,255,255,0.2);color:#fff}
        .del-btn{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;font-family:inherit}
        .del-btn:hover{background:rgba(239,68,68,0.15)}
        .card{background:#050515;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:24px}
        .stat-card{background:#050515;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px}
      `}</style>

      <div style={{maxWidth:"1200px",margin:"0 auto"}}>

        {/* HEADER — Profile summary */}
        <div style={{display:"flex",alignItems:"center",gap:"20px",marginBottom:"32px",flexWrap:"wrap"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"linear-gradient(135deg,#0055ff,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0,overflow:"hidden"}}>
            {profile?.avatar_url ? <img src={profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "👤"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Cinzel, serif",fontSize:"22px",fontWeight:700,color:"#fff"}}>{profile?.username || shortAddr(walletAddress)}</div>
            <div style={{fontSize:"12px",color:"#444460",marginTop:"4px"}}>{shortAddr(walletAddress)}</div>
            {profile?.bio && <div style={{fontSize:"13px",color:"#8899bb",marginTop:"4px"}}>{profile.bio}</div>}
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <a href="/sell" style={{textDecoration:"none"}}><button className="action-btn">+ List Card</button></a>
            <a href="/marketplace" style={{textDecoration:"none"}}><button className="action-btn">Browse</button></a>
            <button className="action-btn" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:"4px",marginBottom:"28px",overflowX:"auto",paddingBottom:"4px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn${tab===t?" active":""}`} style={{color:tab===t?"#0099ff":"rgba(255,255,255,0.4)"}} onClick={() => setTab(t)}>
              {t}
              {t==="Listings" && listings.length > 0 && <span style={{marginLeft:"6px",fontSize:"10px",background:"rgba(0,153,255,0.15)",padding:"1px 6px",borderRadius:"10px",color:"#0099ff"}}>{listings.length}</span>}
              {t==="Orders" && orders.length > 0 && <span style={{marginLeft:"6px",fontSize:"10px",background:"rgba(0,153,255,0.15)",padding:"1px 6px",borderRadius:"10px",color:"#0099ff"}}>{orders.length}</span>}
              {t==="Alerts" && alerts.length > 0 && <span style={{marginLeft:"6px",fontSize:"10px",background:"rgba(0,153,255,0.15)",padding:"1px 6px",borderRadius:"10px",color:"#0099ff"}}>{alerts.length}</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab==="Overview" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px",marginBottom:"28px"}}>
              {[
                { label:"Portfolio Value", value: totalValue > 0 ? `$${fmt(totalValue)}` : "—", color:"#0099ff" },
                { label:"Active Listings", value: listings.filter(l=>l.status==="active").length, color:"#00ff88" },
                { label:"Total Orders", value: orders.length, color:"#00d4ff" },
                { label:"Price Alerts", value: alerts.length, color:"#a78bfa" },
                { label:"Saved Decks", value: decks.length, color:"#ffcc00" },
                { label:"Tournaments", value: tournaments.length, color:"#ff6b6b" },
              ].map((s,i) => (
                <div key={i} className="stat-card">
                  <div style={{fontSize:"11px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>{s.label}</div>
                  <div style={{fontFamily:"Cinzel, serif",fontSize:"24px",fontWeight:700,color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div className="card" style={{marginBottom:"16px"}}>
                <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"16px"}}>Recent Orders</div>
                {orders.slice(0,5).map((o,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>{o.card_name}</div>
                      <div style={{fontSize:"11px",color:"#444460"}}>{o.buyer_address===walletAddress?"Bought":"Sold"} · {new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{fontSize:"13px",fontWeight:700,color:o.buyer_address===walletAddress?"#ff6b6b":"#00ff88"}}>{o.buyer_address===walletAddress?"-":"+"}${fmt(parseFloat(o.price_usd||"0"))}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Social links */}
            {(profile?.twitter || profile?.discord || profile?.telegram) && (
              <div className="card">
                <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"16px"}}>Social Links</div>
                <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                  {profile?.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" style={{textDecoration:"none",color:"#0099ff",fontSize:"13px"}}>🐦 @{profile.twitter}</a>}
                  {profile?.discord && <span style={{color:"#a78bfa",fontSize:"13px"}}>💬 {profile.discord}</span>}
                  {profile?.telegram && <a href={`https://t.me/${profile.telegram}`} target="_blank" style={{textDecoration:"none",color:"#0099ff",fontSize:"13px"}}>✈️ @{profile.telegram}</a>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {tab==="Portfolio" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"24px"}}>
              <div className="stat-card"><div style={{fontSize:"11px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Total Value</div><div style={{fontFamily:"Cinzel, serif",fontSize:"28px",fontWeight:700,color:"#0099ff"}}>${fmt(totalValue)}</div></div>
              <div className="stat-card"><div style={{fontSize:"11px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Tokens Held</div><div style={{fontFamily:"Cinzel, serif",fontSize:"28px",fontWeight:700,color:"#00d4ff"}}>{holdings.length}</div></div>
              <div className="stat-card" style={{cursor:"pointer"}} onClick={fetchPortfolio}><div style={{fontSize:"11px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Refresh</div><div style={{fontFamily:"Cinzel, serif",fontSize:"14px",fontWeight:600,color:"#fff"}}>{portfolioLoading ? "Updating..." : "🔄 Click to refresh"}</div></div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"20px",alignItems:"start"}}>
              {/* Holdings table */}
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff"}}>Holdings</div>
                  <div style={{display:"flex",gap:"6px"}}>
                    {(["value","balance","symbol"] as const).map(s => (
                      <button key={s} onClick={()=>setSortBy(s)} style={{background:sortBy===s?"rgba(0,153,255,0.12)":"none",border:sortBy===s?"1px solid rgba(0,153,255,0.2)":"1px solid transparent",color:sortBy===s?"#0099ff":"rgba(255,255,255,0.4)",padding:"5px 12px",borderRadius:"6px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{s}</button>
                    ))}
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    {["Token","Balance","Price","Value","Allocation"].map(h => <th key={h} style={{padding:"12px 24px",textAlign:h==="Token"?"left":"right",fontSize:"10px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:400}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {portfolioLoading ? Array(4).fill(0).map((_,i) => <tr key={i}>{[1,2,3,4,5].map(j=><td key={j} style={{padding:"16px 24px"}}><div style={{height:"14px",background:"rgba(255,255,255,0.04)",borderRadius:"4px",animation:"pulse 1.5s infinite"}}/></td>)}</tr>) :
                    sorted.map((h,i) => (
                      <tr key={h.coinType} className="tok-row" style={{borderBottom:"1px solid rgba(255,255,255,0.03)",transition:"background 0.15s"}}>
                        <td style={{padding:"14px 24px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                            <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"linear-gradient(135deg,#0055ff,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"#fff",flexShrink:0,overflow:"hidden"}}>
                              {h.iconUrl ? <img src={h.iconUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none"}} /> : h.symbol.slice(0,2)}
                            </div>
                            <div><div style={{fontWeight:700,fontSize:"13px",color:"#fff"}}>{h.symbol}</div><div style={{fontSize:"11px",color:"#444460"}}>{h.name}</div></div>
                          </div>
                        </td>
                        <td style={{padding:"14px 24px",textAlign:"right",fontSize:"13px",color:"#8899bb"}}>{fmt(h.balance,4)}</td>
                        <td style={{padding:"14px 24px",textAlign:"right",fontSize:"13px",color:h.price?"#8899bb":"#333350"}}>{h.price?`$${fmt(h.price,4)}`:"—"}</td>
                        <td style={{padding:"14px 24px",textAlign:"right",fontSize:"13px",fontWeight:700,color:h.value?"#fff":"#333350"}}>{h.value?`$${fmt(h.value)}`:"—"}</td>
                        <td style={{padding:"14px 24px",textAlign:"right"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px"}}>
                            <div style={{width:"60px",height:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${Math.min(h.pct,100)}%`,background:COLORS[i%COLORS.length],borderRadius:"2px"}}/>
                            </div>
                            <span style={{fontSize:"12px",fontWeight:600,color:h.pct>0?COLORS[i%COLORS.length]:"#333350",minWidth:"44px",textAlign:"right"}}>{fmt(h.pct)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pie chart */}
              <div className="card">
                <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"16px"}}>Allocation</div>
                <div style={{position:"relative",height:"200px"}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} stroke="transparent"/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                    <div style={{fontSize:"10px",color:"#444460",textTransform:"uppercase",letterSpacing:"0.1em"}}>Total</div>
                    <div style={{fontFamily:"Cinzel, serif",fontSize:"16px",fontWeight:700,color:"#fff"}}>${fmt(totalValue)}</div>
                  </div>
                </div>
                <div style={{marginTop:"16px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {pieData.slice(0,6).map((d,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:COLORS[i%COLORS.length],flexShrink:0}}/><span style={{fontSize:"12px",color:"#8899bb"}}>{d.name}</span></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:"12px",fontWeight:600,color:"#fff"}}>${fmt(d.value)}</div><div style={{fontSize:"10px",color:"#444460"}}>{fmt(d.pct)}%</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {tab==="Listings" && (
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff"}}>My Listings</div>
              <a href="/sell" style={{textDecoration:"none"}}><button className="action-btn">+ New Listing</button></a>
            </div>
            {listings.length === 0 ? <div style={{padding:"48px",textAlign:"center",color:"#444460"}}>No listings yet. <a href="/sell" style={{color:"#0099ff"}}>List a card →</a></div> :
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["Card","Game","Condition","Price","Status",""].map(h => <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:"10px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {listings.map((l,i) => (
                  <tr key={l.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"14px 20px"}}><div style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>{l.card_name}</div></td>
                    <td style={{padding:"14px 20px",fontSize:"12px",color:"#8899bb"}}>{l.game}</td>
                    <td style={{padding:"14px 20px",fontSize:"12px",color:"#8899bb"}}>{l.condition}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",fontWeight:700,color:"#0099ff"}}>${fmt(parseFloat(l.price_usd||"0"))}</td>
                    <td style={{padding:"14px 20px"}}><span style={{fontSize:"10px",padding:"3px 8px",borderRadius:"4px",background:l.status==="active"?"rgba(0,255,136,0.1)":"rgba(255,255,255,0.05)",color:l.status==="active"?"#00ff88":"#8899bb",border:`1px solid ${l.status==="active"?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.08)"}`}}>{l.status}</span></td>
                    <td style={{padding:"14px 20px"}}><button className="del-btn" onClick={()=>deleteListing(l.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        )}

        {/* ORDERS TAB */}
        {tab==="Orders" && (
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff"}}>Order History</div>
            </div>
            {orders.length === 0 ? <div style={{padding:"48px",textAlign:"center",color:"#444460"}}>No orders yet.</div> :
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["Card","Type","Price","Date","Status"].map(h => <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:"10px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.map((o,i) => (
                  <tr key={o.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"14px 20px"}}><div style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>{o.card_name}</div></td>
                    <td style={{padding:"14px 20px"}}><span style={{fontSize:"11px",padding:"3px 8px",borderRadius:"4px",background:o.buyer_address===walletAddress?"rgba(239,68,68,0.08)":"rgba(0,255,136,0.08)",color:o.buyer_address===walletAddress?"#ff6b6b":"#00ff88"}}>{o.buyer_address===walletAddress?"Bought":"Sold"}</span></td>
                    <td style={{padding:"14px 20px",fontSize:"13px",fontWeight:700,color:o.buyer_address===walletAddress?"#ff6b6b":"#00ff88"}}>{o.buyer_address===walletAddress?"-":"+"}${fmt(parseFloat(o.price_usd||"0"))}</td>
                    <td style={{padding:"14px 20px",fontSize:"12px",color:"#8899bb"}}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{padding:"14px 20px"}}><span style={{fontSize:"10px",color:"#00ff88"}}>✓ Complete</span></td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        )}

        {/* ALERTS TAB */}
        {tab==="Alerts" && (
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff"}}>Price Alerts</div>
              <a href="/alerts" style={{textDecoration:"none"}}><button className="action-btn">+ New Alert</button></a>
            </div>
            {alerts.length === 0 ? <div style={{padding:"48px",textAlign:"center",color:"#444460"}}>No alerts yet. <a href="/alerts" style={{color:"#0099ff"}}>Create one →</a></div> :
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["Card","Target Price","Status",""].map(h => <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:"10px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {alerts.map((a,i) => (
                  <tr key={a.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"14px 20px",fontSize:"13px",fontWeight:600,color:"#fff"}}>{a.card_name}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",fontWeight:700,color:"#0099ff"}}>${fmt(parseFloat(a.target_price||"0"))}</td>
                    <td style={{padding:"14px 20px"}}><span style={{fontSize:"10px",padding:"3px 8px",borderRadius:"4px",background:"rgba(0,255,136,0.08)",color:"#00ff88"}}>Active</span></td>
                    <td style={{padding:"14px 20px"}}><button className="del-btn" onClick={()=>deleteAlert(a.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        )}

        {/* DECKS TAB */}
        {tab==="Decks" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <div style={{fontFamily:"Cinzel, serif",fontSize:"18px",fontWeight:700,color:"#fff"}}>Saved Decks</div>
              <a href="/deckbuilder" style={{textDecoration:"none"}}><button className="action-btn">+ Build Deck</button></a>
            </div>
            {decks.length === 0 ? <div className="card" style={{textAlign:"center",color:"#444460",padding:"48px"}}>No decks saved. <a href="/deckbuilder" style={{color:"#0099ff"}}>Build one →</a></div> :
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
              {decks.map((d,i) => (
                <div key={i} className="card">
                  <div style={{fontFamily:"Cinzel, serif",fontSize:"14px",fontWeight:600,color:"#fff",marginBottom:"6px"}}>{d.deck_name||"Untitled Deck"}</div>
                  <div style={{fontSize:"12px",color:"#444460",marginBottom:"12px"}}>{d.card_count||0} cards · {new Date(d.created_at).toLocaleDateString()}</div>
                  <a href="/deckbuilder" style={{textDecoration:"none"}}><button className="action-btn" style={{width:"100%",textAlign:"center"}}>View Deck →</button></a>
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* TOURNAMENTS TAB */}
        {tab==="Tournaments" && (
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",fontWeight:600,color:"#fff"}}>Tournament History</div>
              <a href="/optcg" style={{textDecoration:"none"}}><button className="action-btn">Join Tournament →</button></a>
            </div>
            {tournaments.length === 0 ? <div style={{padding:"48px",textAlign:"center",color:"#444460"}}>No tournaments joined yet. <a href="/optcg" style={{color:"#0099ff"}}>Join one →</a></div> :
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["Week","Points","Wins","Losses","Placement"].map(h => <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:"10px",color:"#444460",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {tournaments.map((t,i) => (
                  <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"14px 20px",fontSize:"13px",color:"#fff"}}>Week {t.tournament_week}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",fontWeight:700,color:"#0099ff"}}>{t.points||0}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",color:"#00ff88"}}>{t.wins||0}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",color:"#ff6b6b"}}>{t.losses||0}</td>
                    <td style={{padding:"14px 20px",fontSize:"13px",color:t.placement===1?"#ffcc00":"#8899bb"}}>{t.placement ? `#${t.placement}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={e=>{if(e.target===e.currentTarget)setEditing(false)}}>
          <div style={{background:"#050515",border:"1px solid rgba(0,153,255,0.2)",borderRadius:"16px",padding:"32px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontFamily:"Cinzel, serif",fontSize:"18px",fontWeight:700,color:"#fff",marginBottom:"24px"}}>Edit Profile</div>
            {[
              {label:"Username",key:"username",placeholder:"Your username"},
              {label:"Email",key:"email",placeholder:"your@email.com"},
              {label:"Twitter",key:"twitter",placeholder:"@handle"},
              {label:"Discord",key:"discord",placeholder:"user#1234"},
              {label:"Telegram",key:"telegram",placeholder:"@username"},
            ].map(f => (
              <div key={f.key} style={{marginBottom:"16px"}}>
                <label style={lbl}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inp}/>
              </div>
            ))}
            <div style={{marginBottom:"24px"}}>
              <label style={lbl}>Bio</label>
              <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} placeholder="Tell collectors about yourself..." style={{...inp,minHeight:"80px",resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={saveProfile} disabled={saving} style={{flex:1,background:"linear-gradient(135deg,#0055ff,#0099ff)",color:"#fff",border:"none",borderRadius:"8px",padding:"12px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{saving?"Saving...":"Save Profile"}</button>
              <button onClick={()=>setEditing(false)} style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"12px 20px",fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DashboardInner as default };
