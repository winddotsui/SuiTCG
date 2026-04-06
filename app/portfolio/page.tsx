"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { showSuccess, showError } from "../../lib/toast";

const COLORS = ["#0099ff","#00d4ff","#00ff88","#a78bfa","#ffcc00","#ff6b6b","#f472b6","#34d399","#fb923c","#60a5fa"];
const SUI_COINGECKO_IDS: Record<string, string> = {
  "0x2::sui::SUI": "sui",
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN": "usd-coin",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN": "tether",
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdc::USDC": "usd-coin",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC": "usd-coin",
  "0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS": "cetus-protocol",
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT": "volo-staked-sui",
  "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI": "aftermath-staked-sui",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN": "wbtc",
  "0x9b5a3db572955df65f071e09f29b8b8f0db952c5ae0ffc2d4f8a24d5882c81d1::wal::WAL": "walrus-2",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946ea44::deep::DEEP": "deepbook",
};

interface TokenHolding {
  coinType: string; symbol: string; name: string; iconUrl: string | null;
  balance: number; decimals: number; price: number | null; value: number | null; pct: number;
}

function truncate(addr: string) { return addr.slice(0,6)+"..."+addr.slice(-4); }
function fmt(n: number, d = 2) { return n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}); }

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

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5].map(i=>(
      <td key={i} style={{padding:"16px 24px"}}>
        <div style={{height:"14px",background:"rgba(255,255,255,0.04)",borderRadius:"4px",animation:"pulse 1.5s ease-in-out infinite"}}/>
      </td>
    ))}</tr>
  );
}

function PortfolioInner() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null);
  const [sortBy, setSortBy] = useState<"value"|"balance"|"symbol">("value");
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number|null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      const balances = await client.getAllBalances({ owner: account.address });
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
      let prices: Record<string,{usd:number}> = {};
      try { const r = await fetch("/api/sui-price"); const d = await r.json(); if (d.price) prices["sui"]={usd:d.price}; } catch {}
      const withPrices = holdingsRaw.map(h => {
        const cgId = SUI_COINGECKO_IDS[h.coinType];
        const price = cgId && prices[cgId] ? prices[cgId].usd : null;
        return { ...h, price, value: price !== null ? h.balance * price : null };
      });
      const totalValue = withPrices.reduce((sum,h)=>sum+(h.value||0),0);
      const totalBalance = withPrices.reduce((sum,h)=>sum+h.balance,0);
      const final = withPrices.map(h=>({
        ...h,
        pct: totalValue>0&&h.value
          ? (h.value/totalValue)*100
          : totalBalance>0
          ? (h.balance/totalBalance)*100
          : 0
      })).filter(h=>h.balance>0);
      setHoldings(final); setLastUpdated(new Date());
    } catch { showError("Failed to fetch portfolio"); }
    setLoading(false);
  }, [account?.address, client]);

  useEffect(()=>{ if (account?.address) fetchPortfolio(); },[account?.address]);
  useEffect(()=>{ const t=setInterval(()=>{ if(account?.address) fetchPortfolio(); },30000); return ()=>clearInterval(t); },[account?.address,fetchPortfolio]);

  const sorted = [...holdings].sort((a,b)=>{
    if (sortBy==="value") return (b.value||0)-(a.value||0);
    if (sortBy==="balance") return b.balance-a.balance;
    return a.symbol.localeCompare(b.symbol);
  });
  const totalValue = holdings.reduce((sum,h)=>sum+(h.value||0),0);
  const pieData = holdings.filter(h=>h.value&&h.value>0).map((h,i)=>({name:h.symbol,value:h.value||0,pct:h.pct,color:COLORS[i%COLORS.length]}));

  function exportCSV() {
    const rows=[["Symbol","Name","Balance","Price (USD)","Value (USD)","Allocation %"]];
    sorted.forEach(h=>rows.push([h.symbol,h.name,fmt(h.balance,4),h.price?fmt(h.price,4):"N/A",h.value?fmt(h.value):"N/A",fmt(h.pct)+"%"]));
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="wavetcg-portfolio.csv"; a.click();
    showSuccess("Portfolio exported!");
  }

  function copyAddress() {
    if (!account?.address) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  return (
    <div style={{minHeight:"100vh",background:"#000008"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tok-row{transition:background 0.15s;}
        .tok-row:hover{background:rgba(0,153,255,0.04)!important;}
        .srt-btn{transition:all 0.15s;}
        .srt-btn:hover{color:#0099ff!important;border-color:rgba(0,153,255,0.3)!important;}
        .act-btn{transition:all 0.15s;}
        .act-btn:hover{background:rgba(255,255,255,0.05)!important;}
      `}</style>

      <div style={{background:"linear-gradient(180deg,#000510 0%,#000008 100%)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"48px 32px 40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-100px",left:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(0,80,255,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"-80px",right:"10%",width:"400px",height:"400px",background:"radial-gradient(circle,rgba(0,212,255,0.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"24px"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",background:"rgba(0,153,255,0.08)",border:"1px solid rgba(0,153,255,0.2)",borderRadius:"20px",marginBottom:"16px"}}>
              <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00ff88",display:"inline-block"}}/>
              <span style={{fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#0099ff"}}>Live · Sui Mainnet</span>
            </div>
            <h1 style={{fontFamily:"Cinzel, serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:900,color:"#fff",marginBottom:"8px",lineHeight:1.1}}>Portfolio Tracker</h1>
            <p style={{fontSize:"14px",color:"#8899bb",lineHeight:1.6}}>Real-time Sui ecosystem token balances and values.</p>
          </div>
          {account && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"rgba(0,153,255,0.06)",border:"1px solid rgba(0,153,255,0.15)",borderRadius:"10px"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00ff88"}}/>
                <span style={{fontSize:"13px",color:"#0099ff",fontFamily:"monospace"}}>{truncate(account.address)}</span>
                <button onClick={copyAddress} className="act-btn" style={{background:"transparent",border:"none",color:copied?"#00ff88":"#666680",fontSize:"13px",cursor:"pointer",padding:"2px 6px",borderRadius:"4px"}}>
                  {copied?"✓":"⎘"}
                </button>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={fetchPortfolio} className="act-btn" style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",color:"#8899bb",fontSize:"12px",cursor:"pointer"}}>
                  <span style={{display:"inline-block",animation:loading?"spin 1s linear infinite":"none"}}>⟳</span>
                  {loading?"Refreshing...":"Refresh"}
                </button>
                <button onClick={exportCSV} className="act-btn" style={{padding:"8px 14px",background:"rgba(0,255,136,0.04)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:"8px",color:"#00ff88",fontSize:"12px",cursor:"pointer"}}>↓ CSV</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px"}}>
        {!account ? (
          <div style={{textAlign:"center",padding:"100px 0",animation:"fadeIn 0.5s ease"}}>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"rgba(0,153,255,0.08)",border:"1px solid rgba(0,153,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:"32px"}}>◈</div>
            <div style={{fontFamily:"Cinzel, serif",fontSize:"22px",color:"#fff",marginBottom:"10px"}}>Connect Your Wallet</div>
            <p style={{fontSize:"14px",color:"#8899bb",maxWidth:"320px",margin:"0 auto"}}>Connect your Sui wallet using the button in the top right to view your portfolio.</p>
          </div>
        ) : (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginBottom:"28px"}}>
              {[
                {label:"Total Value",value:loading&&holdings.length===0?"···":`$${fmt(totalValue)}`,color:"#fff",big:true},
                {label:"Tokens Held",value:holdings.length.toString(),color:"#0099ff",big:false},
                {label:"Last Updated",value:lastUpdated?lastUpdated.toLocaleTimeString():"—",color:"#8899bb",big:false},
              ].map((s,i)=>(
                <div key={i} style={{background:"#050515",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",padding:"20px 24px"}}>
                  <div style={{fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"#333350",marginBottom:"8px"}}>{s.label}</div>
                  <div style={{fontFamily:s.big?"Cinzel, serif":"DM Sans, sans-serif",fontSize:s.big?"28px":"20px",fontWeight:700,color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:pieData.length>1?"1fr 300px":"1fr",gap:"20px",alignItems:"start"}}>
              <div style={{background:"#050515",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
                <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",color:"#fff"}}>Holdings</div>
                  <div style={{display:"flex",gap:"6px"}}>
                    {(["value","balance","symbol"] as const).map(s=>(
                      <button key={s} className="srt-btn" onClick={()=>setSortBy(s)} style={{padding:"5px 12px",background:sortBy===s?"rgba(0,153,255,0.1)":"transparent",border:`1px solid ${sortBy===s?"rgba(0,153,255,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:"6px",color:sortBy===s?"#0099ff":"#555570",fontSize:"11px",cursor:"pointer",textTransform:"capitalize"}}>{s}</button>
                    ))}
                  </div>
                </div>
                {loading&&holdings.length===0?(
                  <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table>
                ):sorted.length===0?(
                  <div style={{padding:"60px",textAlign:"center"}}>
                    <div style={{fontSize:"32px",marginBottom:"12px",opacity:0.3}}>◈</div>
                    <div style={{fontSize:"14px",color:"#444460"}}>No tokens found in this wallet.</div>
                  </div>
                ):(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        {["Token","Balance","Price","Value","Allocation"].map(h=>(
                          <th key={h} style={{padding:"12px 24px",textAlign:h==="Token"?"left":"right",fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:"#333350",fontWeight:500}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((h,i)=>(
                        <tr key={h.coinType} className="tok-row" style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <td style={{padding:"16px 24px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                              {h.iconUrl?(
                                <img src={h.iconUrl} alt={h.symbol} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${COLORS[i%COLORS.length]}33`}} onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none";}}/>
                              ):(
                                <div style={{width:"32px",height:"32px",borderRadius:"50%",background:`${COLORS[i%COLORS.length]}15`,border:`1px solid ${COLORS[i%COLORS.length]}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:COLORS[i%COLORS.length],flexShrink:0}}>{h.symbol.slice(0,2)}</div>
                              )}
                              <div>
                                <div style={{fontSize:"14px",fontWeight:600,color:"#fff"}}>{h.symbol}</div>
                                <div style={{fontSize:"11px",color:"#444460",marginTop:"1px"}}>{h.name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"16px 24px",textAlign:"right",fontSize:"13px",color:"#c8d8f0",fontFamily:"monospace"}}>{fmt(h.balance,4)}</td>
                          <td style={{padding:"16px 24px",textAlign:"right",fontSize:"13px",color:h.price?"#8899bb":"#333350"}}>{h.price?`$${fmt(h.price,4)}`:"—"}</td>
                          <td style={{padding:"16px 24px",textAlign:"right",fontSize:"14px",fontWeight:700,color:h.value?"#fff":"#333350"}}>{h.value?`$${fmt(h.value)}`:"—"}</td>
                          <td style={{padding:"16px 24px",textAlign:"right"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"10px",justifyContent:"flex-end"}}>
                              <div style={{width:"64px",height:"3px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                                <div style={{width:`${Math.min(h.pct,100)}%`,height:"100%",background:COLORS[i%COLORS.length],borderRadius:"2px",transition:"width 0.5s ease"}}/>
                              </div>
                              <span style={{fontSize:"12px",color:COLORS[i%COLORS.length],minWidth:"40px",textAlign:"right",fontWeight:600}}>{fmt(h.pct)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {pieData.length>0&&(
                <div style={{background:"#050515",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"24px",position:"sticky",top:"80px"}}>
                  <div style={{fontFamily:"Cinzel, serif",fontSize:"15px",color:"#fff",marginBottom:"4px"}}>Allocation</div>
                  <div style={{fontSize:"11px",color:"#444460",marginBottom:"20px"}}>Portfolio breakdown</div>
                  <div style={{position:"relative"}}>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={68} outerRadius={100} dataKey="value" paddingAngle={2} stroke="none"
                          onMouseEnter={(_:any,i:number)=>setActiveIndex(i)} onMouseLeave={()=>setActiveIndex(null)}>
                          {pieData.map((entry,i)=>(
                            <Cell key={i} fill={entry.color} opacity={activeIndex===null||activeIndex===i?1:0.35} style={{cursor:"pointer",transition:"opacity 0.2s"}}/>
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                      {activeIndex!==null?(
                        <>
                          <div style={{fontSize:"11px",color:"#8899bb",marginBottom:"2px"}}>{pieData[activeIndex]?.name}</div>
                          <div style={{fontSize:"16px",fontWeight:700,color:"#fff"}}>${fmt(pieData[activeIndex]?.value||0)}</div>
                          <div style={{fontSize:"12px",color:pieData[activeIndex]?.color}}>{fmt(pieData[activeIndex]?.pct||0)}%</div>
                        </>
                      ):(
                        <>
                          <div style={{fontSize:"10px",color:"#444460",marginBottom:"2px",textTransform:"uppercase",letterSpacing:"0.08em"}}>Total</div>
                          <div style={{fontFamily:"Cinzel, serif",fontSize:"18px",fontWeight:700,color:"#fff"}}>${fmt(totalValue)}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"8px"}}>
                    {pieData.slice(0,6).map((d,i)=>(
                      <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",opacity:activeIndex===null||activeIndex===i?1:0.4,transition:"opacity 0.2s"}}
                        onMouseEnter={()=>setActiveIndex(i)} onMouseLeave={()=>setActiveIndex(null)}>
                        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                          <div style={{width:"10px",height:"10px",borderRadius:"3px",background:d.color,flexShrink:0}}/>
                          <span style={{fontSize:"13px",color:"#c8d8f0"}}>{d.name}</span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>${fmt(d.value)}</div>
                          <div style={{fontSize:"10px",color:"#444460"}}>{fmt(d.pct)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {lastUpdated&&(
              <div style={{textAlign:"center",marginTop:"20px",fontSize:"11px",color:"#333350"}}>
                Auto-refreshes every 30s · Last updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(()=>setMounted(true),[]);
  if (!mounted) return null;
  return <PortfolioInner/>;
}

export default dynamic(()=>Promise.resolve(PortfolioWrapper),{ssr:false});
