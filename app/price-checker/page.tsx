"use client";
import { useState, useEffect, useRef } from "react";

interface CardResult {
  id: string;
  name: string;
  set: string;
  setCode: string;
  imageUrl: string;
  prices: any;
  game: string;
  rarity?: string;
  number?: string;
}

export default function PriceChecker() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);
  const [allVersions, setAllVersions] = useState<CardResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [game, setGame] = useState("all");
  const debounceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, game]);

  async function fetchSuggestions(q: string) {
    setLoading(true);
    try {
      const results: any[] = [];
      if (game === "all" || game === "onepiece") {
        try {
          const res = await fetch(`/api/optcg-cards?search=${encodeURIComponent(q)}`);
          const data = await res.json();
          if (data.cards) data.cards.slice(0, 5).forEach((card: any) => results.push({ name: card.name + " (" + card.code + ")", game: "onepiece", icon: "🏴‍☠️", cardData: card }));
        } catch {}
      }
      if (game === "all" || game === "magic") {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.data) data.data.slice(0, 5).forEach((name: string) => results.push({ name, game: "magic", icon: "✨" }));
      }
      if (game === "all" || game === "pokemon") {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=5`);
        const data = await res.json();
        if (data.data) { const seen = new Set(); data.data.forEach((card: any) => { if (!seen.has(card.name)) { seen.add(card.name); results.push({ name: card.name, game: "pokemon", icon: "⚡" }); } }); }
      }
      if (game === "all" || game === "yugioh") {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=5&offset=0`);
        const data = await res.json();
        if (data.data) data.data.slice(0, 5).forEach((card: any) => results.push({ name: card.name, game: "yugioh", icon: "👁️" }));
      }
      setSuggestions(results.slice(0, 10));
      setShowDropdown(results.length > 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function selectCard(suggestion: any) {
    setQuery(suggestion.name);
    setShowDropdown(false);
    setLoading(true);
    setAllVersions([]);
    setSelectedCard(null);
    try {
      if (suggestion.game === "magic") {
        const res = await fetch(`https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(suggestion.name)}"&unique=prints&order=released`);
        const data = await res.json();
        if (data.data) {
          const versions: CardResult[] = data.data.map((card: any) => ({ id: card.id, name: card.name, set: card.set_name, setCode: card.set, imageUrl: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal, prices: { usd: card.prices?.usd, usd_foil: card.prices?.usd_foil, eur: card.prices?.eur }, game: "magic", rarity: card.rarity, number: card.collector_number }));
          setAllVersions(versions); setSelectedCard(versions[0]);
        }
      } else if (suggestion.game === "pokemon") {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(suggestion.name)}"&orderBy=-set.releaseDate&pageSize=30`);
        const data = await res.json();
        if (data.data) {
          const versions: CardResult[] = data.data.map((card: any) => ({ id: card.id, name: card.name, set: card.set?.name, setCode: card.set?.id, imageUrl: card.images?.large, prices: card.tcgplayer?.prices, game: "pokemon", rarity: card.rarity, number: card.number }));
          setAllVersions(versions); setSelectedCard(versions[0]);
        }
      } else if (suggestion.game === "onepiece") {
        const card = suggestion.cardData;
        if (card) {
          const v = [{ id: card.code || "", name: card.name, set: card.set || "One Piece TCG", setCode: card.code || "", game: "onepiece", rarity: card.rarity || "", imageUrl: card.image || `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`, prices: { usd: card.price ? parseFloat(card.price).toFixed(2) : "N/A" } }];
          setAllVersions(v); setSelectedCard(v[0]);
        }
      } else if (suggestion.game === "yugioh") {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(suggestion.name)}`);
        const data = await res.json();
        if (data.data?.[0]) {
          const card = data.data[0];
          const versions: CardResult[] = card.card_sets?.map((set: any, i: number) => ({ id: `${card.id}-${i}`, name: card.name, set: set.set_name, setCode: set.set_code, imageUrl: card.card_images[0].image_url, prices: card.card_prices?.[0], game: "yugioh", rarity: set.set_rarity, number: set.set_code })) || [];
          setAllVersions(versions); setSelectedCard(versions[0]);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function getPriceRows(card: CardResult) {
    const rows: { label: string; value: string }[] = [];
    if (!card.prices) return rows;
    if (card.game === "magic") {
      if (card.prices.usd) rows.push({ label: "TCGPlayer Normal", value: `$${card.prices.usd}` });
      if (card.prices.usd_foil) rows.push({ label: "TCGPlayer Foil", value: `$${card.prices.usd_foil}` });
      if (card.prices.eur) rows.push({ label: "CardMarket", value: `€${card.prices.eur}` });
    } else if (card.game === "pokemon") {
      Object.entries(card.prices || {}).forEach(([type, vals]: any) => {
        if (vals?.market) rows.push({ label: type.replace(/([A-Z])/g, ' $1'), value: `$${vals.market.toFixed(2)}` });
      });
    } else if (card.game === "yugioh") {
      if (card.prices.tcgplayer_price) rows.push({ label: "TCGPlayer", value: `$${card.prices.tcgplayer_price}` });
      if (card.prices.cardmarket_price) rows.push({ label: "CardMarket", value: `€${card.prices.cardmarket_price}` });
      if (card.prices.ebay_price) rows.push({ label: "eBay", value: `$${card.prices.ebay_price}` });
      if (card.prices.amazon_price) rows.push({ label: "Amazon", value: `$${card.prices.amazon_price}` });
    } else if (card.game === "onepiece") {
      rows.push({ label: "Market Price", value: card.prices?.usd ? `$${card.prices.usd}` : "N/A" });
    }
    return rows;
  }

  const GAMES = [
    { id: "all", label: "All", icon: "🃏" },
    { id: "onepiece", label: "One Piece", icon: "🏴‍☠️" },
    { id: "pokemon", label: "Pokémon", icon: "⚡" },
    { id: "magic", label: "Magic", icon: "✨" },
    { id: "yugioh", label: "Yu-Gi-Oh!", icon: "👁️" },
    { id: "dragonball", label: "Dragon Ball", icon: "🐉" },
    { id: "lorcana", label: "Lorcana", icon: "🌟" },
    { id: "fab", label: "F&B", icon: "⚔️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <style>{`html, body { background: #000008; }`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "clamp(20px, 4vw, 50px) clamp(16px, 4vw, 48px) clamp(14px, 3vw, 32px)", borderBottom: "1px solid rgba(0,153,255,0.12)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "6px" }}>◈ WaveTCG · Live Prices</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 4vw, 48px)", fontWeight: 700, background: "linear-gradient(135deg, #0099ff, #00d4ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" }}>Price Checker</h1>
        <p style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#6b85a8" }}>Search any card — see all versions with live market prices</p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px clamp(12px, 3vw, 24px)" }}>

        {/* Game filter — scrollable pills */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px", overflowX: "auto", paddingBottom: "4px" }}>
          {GAMES.map(g => (
            <button key={g.id} onClick={() => setGame(g.id)} style={{ padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "11px", fontWeight: 500, border: game === g.id ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.1)", background: game === g.id ? "rgba(0,212,255,0.1)" : "transparent", color: game === g.id ? "#00d4ff" : "#8899bb", whiteSpace: "nowrap", flexShrink: 0 }}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search any card... e.g. Charizard, Lightning Bolt, Luffy"
            style={{ width: "100%", background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", padding: "13px 44px 13px 16px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }}
            onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"}
            onBlurCapture={e => { setTimeout(() => setShowDropdown(false), 200); e.currentTarget.style.borderColor = "rgba(0,153,255,0.2)"; }} />
          <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>{loading ? "⏳" : "🔍"}</div>

          {showDropdown && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderTop: "none", borderRadius: "0 0 12px 12px", zIndex: 100, maxHeight: "300px", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.8)" }}>
              {suggestions.map((s, i) => (
                <div key={i} onMouseDown={() => selectCard(s)} style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    <div style={{ fontSize: "10px", color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.game === "magic" ? "Magic: The Gathering" : s.game === "pokemon" ? "Pokémon TCG" : s.game === "yugioh" ? "Yu-Gi-Oh!" : s.game === "onepiece" ? "One Piece TCG" : s.game}</div>
                  </div>
                  <span style={{ fontSize: "10px", color: "#00d4ff", flexShrink: 0 }}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && !selectedCard && (
          <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading prices...</div>
        )}

        {/* Results */}
        {selectedCard && (
          <div>
            {/* Card header — mobile friendly */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px", background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "14px", padding: "16px" }}>
              {selectedCard.imageUrl && (
                <img src={selectedCard.imageUrl} alt={selectedCard.name} style={{ width: "clamp(80px, 25vw, 140px)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.6)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(14px, 3vw, 20px)", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>{selectedCard.name}</div>
                <div style={{ fontSize: "12px", color: "#00d4ff", marginBottom: "4px" }}>{selectedCard.set}</div>
                {selectedCard.rarity && <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "8px" }}>⭐ {selectedCard.rarity}</div>}
                {/* Top price */}
                {getPriceRows(selectedCard)[0] && (
                  <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 700, color: "#0099ff" }}>{getPriceRows(selectedCard)[0].value}</div>
                )}
                <a href={`https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(selectedCard.name)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "8px", padding: "6px 14px", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", borderRadius: "6px", fontSize: "11px", textDecoration: "none", fontWeight: 600 }}>TCGPlayer →</a>
              </div>
            </div>

            {/* Price rows */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.12)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ffffff", marginBottom: "12px" }}>💰 Market Prices</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {getPriceRows(selectedCard).length > 0 ? getPriceRows(selectedCard).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0a1628", borderRadius: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#8899bb", textTransform: "capitalize" }}>{row.label}</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#00d4ff" }}>{row.value}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: "12px", color: "#8899bb", textAlign: "center", padding: "12px" }}>No price data available</div>
                )}
              </div>
            </div>

            {/* All versions */}
            {allVersions.length > 1 && (
              <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.12)", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ffffff", marginBottom: "12px" }}>📦 All {allVersions.length} Versions</div>
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                  {allVersions.map(v => (
                    <div key={v.id} onClick={() => setSelectedCard(v)} style={{ cursor: "pointer", border: selectedCard.id === v.id ? "2px solid #00d4ff" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden", width: "70px", flexShrink: 0, opacity: selectedCard.id === v.id ? 1 : 0.55, transition: "all 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                      onMouseLeave={e => { if (selectedCard.id !== v.id) (e.currentTarget as HTMLDivElement).style.opacity = "0.55"; }}>
                      {v.imageUrl ? <img src={v.imageUrl} alt={v.set} style={{ width: "100%", display: "block" }} /> : <div style={{ width: "70px", height: "98px", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🃏</div>}
                      <div style={{ padding: "3px 4px", background: "#0a1628", fontSize: "8px", color: "#c8d8f0", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.set}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedCard && !loading && query.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "24px" }}>Search any TCG card to see live prices</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {["Lightning Bolt", "Charizard EX", "Blue-Eyes Dragon", "Luffy OP-01"].map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); inputRef.current?.focus(); }} style={{ padding: "7px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", background: "#050515", color: "#c8d8f0", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>{s}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
