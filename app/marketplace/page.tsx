"use client";
import { useState, useEffect } from "react";
import { supabase, Listing } from "../../lib/supabase";

const MOCK_CARDS = [
  { id:"m1", name:"Charizard EX", set_name:"Obsidian Flames", game:"Pokémon TCG", price_usd:295, price_sui:40.5, condition:"PSA 10", art:"🔥", bg:"#2a0808" },
  { id:"m2", name:"Black Lotus", set_name:"Alpha Edition", game:"Magic: The Gathering", price_usd:4200, price_sui:577, condition:"PSA 9", art:"✨", bg:"#14082a" },
  { id:"m3", name:"Blue-Eyes White Dragon", set_name:"LOB 1st Ed", game:"Yu-Gi-Oh!", price_usd:850, price_sui:117, condition:"Mint", art:"⚡", bg:"#080820" },
  { id:"m4", name:"Pikachu Promo", set_name:"World Championship", game:"Pokémon TCG", price_usd:90, price_sui:12.4, condition:"NM", art:"⚡", bg:"#1a1400" },
  { id:"m5", name:"Mox Sapphire", set_name:"Beta Edition", game:"Magic: The Gathering", price_usd:1850, price_sui:254, condition:"PSA 9", art:"💎", bg:"#040e1c" },
  { id:"m6", name:"Mewtwo V Alt Art", set_name:"Lost Origin", game:"Pokémon TCG", price_usd:120, price_sui:16.5, condition:"NM", art:"🌌", bg:"#14082a" },
];

const GAME_ICONS: Record<string, string> = {
  "Pokémon TCG": "⚡",
  "Magic: The Gathering": "✨",
  "Yu-Gi-Oh!": "👁️",
  "One Piece": "🗡️",
  "Dragon Ball": "🐉",
  "Lorcana": "🌟",
  "Flesh & Blood": "⚔️",
  "Digimon": "🎭",
};

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [game, setGame] = useState("All Games");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setListings([...data, ...MOCK_CARDS]);
    } else {
      setListings(MOCK_CARDS);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (search.length > 1) {
      const matches = listings
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, listings]);

  const filtered = listings.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.set_name?.toLowerCase().includes(search.toLowerCase());
    const matchGame = game === "All Games" || c.game === game;
    return matchSearch && matchGame;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price_usd - b.price_usd;
    if (sort === "price-desc") return b.price_usd - a.price_usd;
    return 0;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: "240px", flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 16px", background: "#050515",
        position: "sticky", top: "56px",
        height: "calc(100vh - 56px)", overflowY: "auto",
      }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8899bb", marginBottom: "12px" }}>Game</div>
          {["All Games","Pokémon TCG","Magic: The Gathering","Yu-Gi-Oh!","One Piece","Dragon Ball","Others"].map((g) => (
            <button key={g} onClick={() => setGame(g)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 10px", width: "100%", textAlign: "left",
              background: game === g ? "rgba(0,180,255,0.08)" : "transparent",
              border: game === g ? "1px solid rgba(0,180,255,0.2)" : "1px solid transparent",
              borderRadius: "8px", color: game === g ? "#00d4ff" : "#c8d8f0",
              fontSize: "13px", cursor: "pointer", marginBottom: "3px",
              fontFamily: "DM Sans, sans-serif",
            }}>
              {GAME_ICONS[g] && <span>{GAME_ICONS[g]}</span>}
              {g}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8899bb", marginBottom: "12px" }}>Condition</div>
          {["PSA 10","PSA 9","Mint","NM","LP","MP"].map((c) => (
            <button key={c} style={{
              padding: "5px 10px", margin: "3px",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "6px", background: "transparent",
              color: "#c8d8f0", fontSize: "11px",
              cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            }}>{c}</button>
          ))}
        </div>

        <a href="/sell" style={{
          display: "block", textAlign: "center",
          background: "linear-gradient(135deg, #00b4ff, #0099ff)",
          color: "#fff", padding: "10px",
          borderRadius: "8px", fontSize: "12px",
          fontWeight: 500, textDecoration: "none",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>+ List a Card</a>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "24px 28px" }}>
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <input
              placeholder="🔍  Search cards, sets, games..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => search.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: "100%", background: "#050515",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "10px 16px",
                fontSize: "14px", color: "#ffffff",
                fontFamily: "DM Sans, sans-serif", outline: "none",
                boxSizing: "border-box",
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "#050515", border: "1px solid rgba(0,153,255,0.2)",
                borderRadius: "10px", zIndex: 100, marginTop: "4px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", overflow: "hidden",
              }}>
                {suggestions.map((card, i) => (
                  <div key={i}
                    onClick={() => { setSearch(card.name); setShowSuggestions(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 16px", cursor: "pointer",
                      borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    {card.image_url && (
                      <img src={card.image_url} alt={card.name}
                        style={{ width: "32px", height: "44px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
                        onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{card.name}</div>
                      <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{card.game} · {card.condition} · ${card.price_usd}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0099ff" }}>${card.price_usd}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: "#050515", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "10px 16px",
              fontSize: "13px", color: "#ffffff",
              fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer",
            }}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "20px" }}>
          <strong style={{ color: "#ffffff" }}>{filtered.length}</strong> cards available
          {loading && <span style={{ color: "#0099ff", marginLeft: "8px" }}>· Loading...</span>}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "14px",
        }}>
          {filtered.map(card => (
            <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#050515",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,180,255,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div style={{
                  width: "100%", aspectRatio: "3/2",
                  background: card.bg || "#0a1628",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "48px",
                  overflow: "hidden",
                }}>
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    card.art || GAME_ICONS[card.game] || "🃏"
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{
                    fontFamily: "Cinzel, serif", fontSize: "12px",
                    fontWeight: 600, color: "#ffffff", marginBottom: "2px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{card.name}</div>
                  <div style={{
                    fontSize: "10px", color: "#8899bb",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px",
                  }}>{card.game} · {card.condition}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#00d4ff" }}>${card.price_usd?.toLocaleString()}</div>
                      <div style={{ fontSize: "10px", color: "#0099ff" }}>{card.price_sui} SUI</div>
                    </div>
                    <button style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px", padding: "5px 10px",
                      fontSize: "10px", color: "#c8d8f0",
                      cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                    }}>Buy</button>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
