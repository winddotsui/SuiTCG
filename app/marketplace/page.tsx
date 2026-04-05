"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID || "";

const GAME_ICONS: Record<string, string> = {
  "One Piece TCG": "🏴‍☠️", "Pokemon TCG": "⚡", "Magic: The Gathering": "✨",
  "Yu-Gi-Oh!": "👁️", "Flesh & Blood": "⚔️", "Digimon": "🎭",
  "Dragon Ball": "🐉", "Lorcana": "🌟",
};

const MOCK_CARDS: any[] = [];

const GAMES = ["all","One Piece TCG","Pokemon TCG","Magic: The Gathering","Yu-Gi-Oh!","Flesh & Blood","Dragon Ball","Lorcana","Digimon"];

function MarketplaceContent() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [listings, setListings] = useState<any[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("all");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    setLoading(true);
    try {

      // Fetch listings from our API (server-side, no CORS)
      const listingsRes = await fetch("/api/listings");
      const listingsJson = await listingsRes.json();
      const chainListings = listingsJson.listings || [];

      // Also fetch from Supabase
      const { data } = await supabase.from("listings").select("*").eq("status","active").order("created_at",{ascending:false});
      const supaListings = (data || []).map((l: any) => ({ ...l, is_chain: false }));

      const combined = [...chainListings, ...supaListings];
      setListings(combined);
    } catch {
      setListings([]);
    }
    setLoading(false);
  }

  async function handleBuy(card: any) {
    if (!account) { alert("Connect your Sui wallet first!"); return; }
    if (!card.listing_object_id) { alert("This listing is not yet on-chain purchasable. Coming soon!"); return; }
    setBuying(card.id);
    try {
      const priceMist = BigInt(Math.round(card.price_sui * 1_000_000_000));
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [priceMist]);
      tx.moveCall({
        target: `${CONTRACT_ID}::marketplace::buy_listing`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.object(card.listing_object_id),
          coin,
        ],
      });
      const result = await signAndExecute({ transaction: tx });
      setTxSuccess(result.digest);
      fetchListings();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Transaction failed.");
    }
    setBuying(null);
  }

  const filtered = listings.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = game === "all" || c.game === game;
    return matchSearch && matchGame;
  }).sort((a,b) => sort === "price-asc" ? a.price_usd-b.price_usd : sort === "price-desc" ? b.price_usd-a.price_usd : 0);

  return (
    <div style={{ minHeight:"100vh", background:"#000008", display:"flex" }}>

      {/* ── SIDEBAR ── */}
      <aside className="desktop-only" style={{ width:"180px", flexShrink:0, background:"#050515", borderRight:"1px solid rgba(0,153,255,0.1)", padding:"16px 12px", position:"sticky", top:"56px", height:"calc(100vh - 56px)", overflowY:"auto" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"#0099ff", marginBottom:"10px" }}>Game</div>
        {GAMES.map(g => (
          <button key={g} onClick={() => setGame(g)} style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 10px", borderRadius:"6px", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"12px", border:"none", background:game===g?"rgba(0,153,255,0.1)":"transparent", color:game===g?"#0099ff":"#c8d8f0", marginBottom:"2px" }}>
            {g==="all"?"🃏 All Games":`${GAME_ICONS[g]||"🃏"} ${g}`}
          </button>
        ))}
        <a href="/sell" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg, #0055ff, #0099ff)", color:"#fff", padding:"9px", borderRadius:"8px", fontSize:"12px", fontWeight:600, textDecoration:"none", marginTop:"14px" }}>+ List a Card</a>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, padding:"12px 10px", minWidth:0 }}>

        {/* Search + Sort */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
          <input placeholder="🔍 Search cards..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:"150px", background:"#050515", border:"1px solid rgba(0,153,255,0.15)", borderRadius:"8px", padding:"8px 14px", fontSize:"13px", color:"#ffffff", fontFamily:"DM Sans, sans-serif", outline:"none" }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background:"#050515", border:"1px solid rgba(0,153,255,0.15)", borderRadius:"8px", padding:"8px 10px", fontSize:"12px", color:"#ffffff", outline:"none", cursor:"pointer" }}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* Game filter pills */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"10px", overflowX:"auto", paddingBottom:"2px" }}>
          {GAMES.map(g => (
            <button key={g} onClick={() => setGame(g)} style={{ padding:"4px 10px", borderRadius:"14px", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"11px", border:game===g?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:game===g?"rgba(0,153,255,0.1)":"transparent", color:game===g?"#0099ff":"#c8d8f0", whiteSpace:"nowrap", flexShrink:0 }}>
              {g==="all"?"All":g.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Count + view toggle */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ fontSize:"12px", color:"#c8d8f0" }}>
            <strong style={{ color:"#ffffff" }}>{filtered.length}</strong> cards
            {loading && <span style={{ color:"#0099ff", marginLeft:"6px" }}>· Loading...</span>}
          </div>
          <div style={{ display:"flex", gap:"4px" }}>
            <button onClick={() => setViewMode("grid")} style={{ padding:"4px 10px", borderRadius:"6px", border:viewMode==="grid"?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:viewMode==="grid"?"rgba(0,153,255,0.15)":"transparent", color:viewMode==="grid"?"#0099ff":"#c8d8f0", cursor:"pointer", fontSize:"11px", fontFamily:"DM Sans, sans-serif", fontWeight:600 }}>⊞ Grid</button>
            <button onClick={() => setViewMode("list")} style={{ padding:"4px 10px", borderRadius:"6px", border:viewMode==="list"?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:viewMode==="list"?"rgba(0,153,255,0.15)":"transparent", color:viewMode==="list"?"#0099ff":"#c8d8f0", cursor:"pointer", fontSize:"11px", fontFamily:"DM Sans, sans-serif", fontWeight:600 }}>≡ List</button>
          </div>
        </div>

        {/* ── GRID VIEW — 8 columns on desktop ── */}
        {viewMode==="grid" && (
          <>
            <style>{`
              .card-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 10px;
              }
              @media (max-width: 1400px) { .card-grid { grid-template-columns: repeat(7, 1fr); } }
              @media (max-width: 1200px) { .card-grid { grid-template-columns: repeat(6, 1fr); } }
              @media (max-width: 960px)  { .card-grid { grid-template-columns: repeat(5, 1fr); } }
              @media (max-width: 720px)  { .card-grid { grid-template-columns: repeat(3, 1fr); } }
              @media (max-width: 480px)  { .card-grid { grid-template-columns: repeat(2, 1fr); } }
              .market-card { background:#050515; border:1px solid rgba(255,255,255,0.06); border-radius:8px; overflow:hidden; cursor:pointer; transition: border-color 0.2s, transform 0.15s; }
              .market-card:hover { border-color: rgba(0,153,255,0.4); transform: translateY(-2px); }
            `}</style>
            <div className="card-grid">
              {filtered.map(card => (
                <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration:"none" }}>
                  <div className="market-card">
                    {/* Card image */}
                    <div style={{ width:"100%", aspectRatio:"3/4", background:card.bg||"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", overflow:"hidden" }}>
                      {card.image_url
                        ? <img src={card.image_url} alt={card.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                        : card.art || "🃏"
                      }
                    </div>
                    {/* Card info */}
                    <div style={{ padding:"5px 6px" }}>
                      <div style={{ fontFamily:"Cinzel, serif", fontSize:"8px", fontWeight:600, color:"#ffffff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:"1px" }}>{card.name}</div>
                      <div style={{ fontSize:"7px", color:"#8899bb", marginBottom:"4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{card.game}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:"10px", fontWeight:700, color:"#00d4ff" }}>${card.price_usd?.toLocaleString()}</div>
                        <button
                          onClick={() => handleBuy(card)}
                          style={{ padding:"2px 6px", background:"linear-gradient(135deg, #0055ff, #0099ff)", border:"none", borderRadius:"4px", fontSize:"8px", color:"#fff", fontWeight:600, cursor:"pointer" }}>
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* ── LIST VIEW ── */}
        {viewMode==="list" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
            {filtered.map(card => (
              <a key={card.id+"l"} href={`/card/${card.id}`} style={{ textDecoration:"none" }}>
                <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", padding:"10px 12px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,153,255,0.3)"; (e.currentTarget as HTMLDivElement).style.background="#0a1628"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background="#050515"; }}>
                  <div style={{ width:"36px", height:"48px", borderRadius:"5px", overflow:"hidden", background:card.bg||"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                    {card.image_url ? <img src={card.image_url} alt={card.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} /> : card.art||"🃏"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Cinzel, serif", fontSize:"13px", fontWeight:600, color:"#ffffff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{card.name}</div>
                    <div style={{ fontSize:"10px", color:"#8899bb", marginTop:"1px" }}>{card.game} · {card.condition}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:"14px", fontWeight:700, color:"#00d4ff" }}>${card.price_usd?.toLocaleString()}</div>
                    <div style={{ fontSize:"9px", color:"#0099ff" }}>{card.price_sui} SUI</div>
                  </div>
                  <button onClick={() => handleBuy(card)} style={{ padding:"7px 12px", background:buying===card.id?"rgba(0,153,255,0.3)":"linear-gradient(135deg, #0055ff, #0099ff)", border:"none", borderRadius:"6px", fontSize:"11px", color:"#fff", fontWeight:600, cursor:"pointer", flexShrink:0 }}>{buying===card.id?"..." : "Buy"}</button>
                </div>
              </a>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default function Marketplace() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <MarketplaceContent />;
}
