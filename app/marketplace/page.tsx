"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GAME_ICONS: Record<string, string> = {
  "One Piece TCG": "🏴‍☠️", "Pokemon TCG": "⚡", "Magic: The Gathering": "✨",
  "Yu-Gi-Oh!": "👁️", "Flesh & Blood": "⚔️", "Digimon": "🎭",
  "Dragon Ball": "🐉", "Lorcana": "🌟",
};

const MOCK_CARDS = [
  { id:"m1", name:"Supreme Verdict", game:"Magic: The Gathering", set_name:"Return to Ravnica", condition:"NM", price_usd:10, price_sui:1.37, image_url:"", art:"✨", bg:"#0a0a1a" },
  { id:"m2", name:"Fatal Push", game:"Magic: The Gathering", set_name:"Aether Revolt", condition:"NM", price_usd:20, price_sui:2.75, image_url:"", art:"✨", bg:"#0a0a1a" },
  { id:"m3", name:"Pikachu V", game:"Pokemon TCG", set_name:"PSA 10", condition:"NM", price_usd:5, price_sui:0.69, image_url:"", art:"⚡", bg:"#1a1400" },
  { id:"m4", name:"Charizard EX", game:"Pokemon TCG", set_name:"PSA 10", condition:"NM", price_usd:295, price_sui:40.5, image_url:"", art:"🔥", bg:"#1a0808" },
  { id:"m5", name:"Monkey D. Luffy", game:"One Piece TCG", set_name:"OP01", condition:"NM", price_usd:45, price_sui:6.2, image_url:"https://en.onepiece-cardgame.com/images/cardlist/card/OP01-003.png", art:"🏴‍☠️", bg:"#0a0818" },
  { id:"m6", name:"Dark Magician", game:"Yu-Gi-Oh!", set_name:"LOB", condition:"LP", price_usd:15, price_sui:2.1, image_url:"", art:"👁️", bg:"#0a0818" },
  { id:"m7", name:"Black Lotus", game:"Magic: The Gathering", set_name:"Alpha", condition:"HP", price_usd:4200, price_sui:577, image_url:"", art:"✨", bg:"#0a0a1a" },
  { id:"m8", name:"Roronoa Zoro", game:"One Piece TCG", set_name:"OP01", condition:"NM", price_usd:38, price_sui:5.2, image_url:"https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png", art:"🏴‍☠️", bg:"#0a0818" },
  { id:"m9", name:"Umbreon VMAX", game:"Pokemon TCG", set_name:"Brilliant Stars", condition:"NM", price_usd:220, price_sui:30.2, image_url:"", art:"⚡", bg:"#1a1400" },
];

const GAMES = ["all","One Piece TCG","Pokemon TCG","Magic: The Gathering","Yu-Gi-Oh!","Flesh & Blood","Dragon Ball","Lorcana","Digimon"];

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("all");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      const { data } = await supabase.from("listings").select("*").eq("status","active").order("created_at",{ascending:false});
      setListings(data && data.length > 0 ? [...data,...MOCK_CARDS] : MOCK_CARDS);
    } catch { setListings(MOCK_CARDS); }
    setLoading(false);
  }

  const filtered = listings.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = game === "all" || c.game === game;
    return matchSearch && matchGame;
  }).sort((a,b) => sort === "price-asc" ? a.price_usd-b.price_usd : sort === "price-desc" ? b.price_usd-a.price_usd : 0);

  return (
    <div style={{ minHeight:"100vh", background:"#000008", display:"flex" }}>
      <aside className="desktop-only" style={{ width:"200px", flexShrink:0, background:"#050515", borderRight:"1px solid rgba(0,153,255,0.1)", padding:"20px 14px", position:"sticky", top:"56px", height:"calc(100vh - 56px)", overflowY:"auto" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"#0099ff", marginBottom:"10px" }}>Game</div>
        {GAMES.map(g => (
          <button key={g} onClick={() => setGame(g)} style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 10px", borderRadius:"6px", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"12px", border:"none", background:game===g?"rgba(0,153,255,0.1)":"transparent", color:game===g?"#0099ff":"#c8d8f0", marginBottom:"2px" }}>
            {g==="all"?"🃏 All Games":`${GAME_ICONS[g]||"🃏"} ${g}`}
          </button>
        ))}
        <a href="/sell" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg, #0055ff, #0099ff)", color:"#fff", padding:"10px", borderRadius:"8px", fontSize:"12px", fontWeight:600, textDecoration:"none", marginTop:"16px" }}>+ List a Card</a>
      </aside>

      <main style={{ flex:1, padding:"14px 10px", minWidth:0 }}>
        <div style={{ display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
          <input placeholder="🔍 Search cards..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:"150px", background:"#050515", border:"1px solid rgba(0,153,255,0.15)", borderRadius:"8px", padding:"9px 14px", fontSize:"13px", color:"#ffffff", fontFamily:"DM Sans, sans-serif", outline:"none" }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background:"#050515", border:"1px solid rgba(0,153,255,0.15)", borderRadius:"8px", padding:"9px 10px", fontSize:"12px", color:"#ffffff", outline:"none", cursor:"pointer" }}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        <div style={{ display:"flex", gap:"6px", marginBottom:"10px", overflowX:"auto", paddingBottom:"2px" }}>
          {GAMES.map(g => (
            <button key={g} onClick={() => setGame(g)} style={{ padding:"5px 10px", borderRadius:"14px", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"11px", border:game===g?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:game===g?"rgba(0,153,255,0.1)":"transparent", color:game===g?"#0099ff":"#c8d8f0", whiteSpace:"nowrap", flexShrink:0 }}>
              {g==="all"?"All":g.split(" ")[0]}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ fontSize:"12px", color:"#c8d8f0" }}><strong style={{ color:"#ffffff" }}>{filtered.length}</strong> cards{loading&&<span style={{ color:"#0099ff", marginLeft:"6px" }}>· Loading...</span>}</div>
          <div style={{ display:"flex", gap:"4px" }}>
            <button onClick={() => setViewMode("grid")} style={{ padding:"5px 10px", borderRadius:"6px", border:viewMode==="grid"?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:viewMode==="grid"?"rgba(0,153,255,0.15)":"transparent", color:viewMode==="grid"?"#0099ff":"#c8d8f0", cursor:"pointer", fontSize:"11px", fontFamily:"DM Sans, sans-serif", fontWeight:600 }}>⊞ Grid</button>
            <button onClick={() => setViewMode("list")} style={{ padding:"5px 10px", borderRadius:"6px", border:viewMode==="list"?"1px solid #0099ff":"1px solid rgba(255,255,255,0.1)", background:viewMode==="list"?"rgba(0,153,255,0.15)":"transparent", color:viewMode==="list"?"#0099ff":"#c8d8f0", cursor:"pointer", fontSize:"11px", fontFamily:"DM Sans, sans-serif", fontWeight:600 }}>≡ List</button>
          </div>
        </div>

        {viewMode==="grid" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
            {filtered.map(card => (
              <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration:"none" }}>
                <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", overflow:"hidden", cursor:"pointer" }}>
                  <div style={{ width:"100%", aspectRatio:"3/4", background:card.bg||"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", overflow:"hidden" }}>
                    {card.image_url ? <img src={card.image_url} alt={card.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} /> : card.art||"🃏"}
                  </div>
                  <div style={{ padding:"6px 7px" }}>
                    <div style={{ fontFamily:"Cinzel, serif", fontSize:"9px", fontWeight:600, color:"#ffffff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:"1px" }}>{card.name}</div>
                    <div style={{ fontSize:"8px", color:"#8899bb", marginBottom:"3px" }}>{card.game}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:"11px", fontWeight:700, color:"#00d4ff" }}>${card.price_usd?.toLocaleString()}</div>
                      <button style={{ padding:"2px 7px", background:"linear-gradient(135deg, #0055ff, #0099ff)", border:"none", borderRadius:"4px", fontSize:"9px", color:"#fff", fontWeight:600, cursor:"pointer" }}>Buy</button>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {viewMode==="list" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
            {filtered.map(card => (
              <a key={card.id+"l"} href={`/card/${card.id}`} style={{ textDecoration:"none" }}>
                <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", padding:"10px 12px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,153,255,0.3)"; (e.currentTarget as HTMLDivElement).style.background="#0a1628"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background="#050515"; }}>
                  <div style={{ width:"38px", height:"52px", borderRadius:"5px", overflow:"hidden", background:card.bg||"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>
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
                  <button style={{ padding:"7px 12px", background:"linear-gradient(135deg, #0055ff, #0099ff)", border:"none", borderRadius:"6px", fontSize:"11px", color:"#fff", fontWeight:600, cursor:"pointer", flexShrink:0 }}>Buy</button>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
