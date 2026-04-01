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
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

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
          if (data.cards) {
            data.cards.slice(0, 5).forEach((card: any) => {
              results.push({ name: card.name + " (" + card.code + ")", game: "onepiece", icon: "🏴‍☠️", cardData: card });
            });
          }
        } catch {}
      }

      if (game === "all" || game === "magic") {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.data) {
          data.data.slice(0, 5).forEach((name: string) => {
            results.push({ name, game: "magic", icon: "✨" });
          });
        }
      }

      if (game === "all" || game === "pokemon") {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=5`);
        const data = await res.json();
        if (data.data) {
          const seen = new Set();
          data.data.forEach((card: any) => {
            if (!seen.has(card.name)) {
              seen.add(card.name);
              results.push({ name: card.name, game: "pokemon", icon: "⚡" });
            }
          });
        }
      }

      if (game === "all" || game === "yugioh") {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=5&offset=0`);
        const data = await res.json();
        if (data.data) {
          data.data.slice(0, 5).forEach((card: any) => {
            results.push({ name: card.name, game: "yugioh", icon: "👁️" });
          });
        }
      }

      setSuggestions(results.slice(0, 10));
      setShowDropdown(results.length > 0);
    } catch (e) {
      console.error(e);
    }
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
          const versions: CardResult[] = data.data.map((card: any) => ({
            id: card.id,
            name: card.name,
            set: card.set_name,
            setCode: card.set,
            imageUrl: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
            prices: {
              usd: card.prices?.usd,
              usd_foil: card.prices?.usd_foil,
              eur: card.prices?.eur,
            },
            game: "magic",
            rarity: card.rarity,
            number: card.collector_number,
          }));
          setAllVersions(versions);
          setSelectedCard(versions[0]);
        }
      } else if (suggestion.game === "pokemon") {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(suggestion.name)}"&orderBy=-set.releaseDate&pageSize=30`);
        const data = await res.json();
        if (data.data) {
          const versions: CardResult[] = data.data.map((card: any) => ({
            id: card.id,
            name: card.name,
            set: card.set?.name,
            setCode: card.set?.id,
            imageUrl: card.images?.large,
            prices: card.tcgplayer?.prices,
            game: "pokemon",
            rarity: card.rarity,
            number: card.number,
          }));
          setAllVersions(versions);
          setSelectedCard(versions[0]);
        }
      } else if (suggestion.game === "onepiece") {
        const card = suggestion.cardData;
        if (card) {
          setAllVersions([{
            id: card.code || card.id || "",
            name: card.name,
            set: card.set || "One Piece TCG",
            setCode: card.code || "",
            game: "onepiece",
            rarity: card.rarity || "",
            imageUrl: card.image || `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`,
            prices: { usd: card.price ? parseFloat(card.price).toFixed(2) : "N/A" },
          }]);
        }
      } else if (suggestion.game === "dragonball" || suggestion.game === "digimon" || suggestion.game === "lorcana" || suggestion.game === "fab" || suggestion.game === "weiss" || suggestion.game === "unionarena") {
        setAllVersions([{
          id: suggestion.name,
          name: suggestion.name,
          set: "Coming Soon",
          setCode: "",
          game: suggestion.game,
          rarity: "",
          imageUrl: "",
          prices: { usd: "Check TCGPlayer" },
        }]);
      } else if (suggestion.game === "yugioh") {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(suggestion.name)}`);
        const data = await res.json();
        if (data.data?.[0]) {
          const card = data.data[0];
          const versions: CardResult[] = card.card_sets?.map((set: any, i: number) => ({
            id: `${card.id}-${i}`,
            name: card.name,
            set: set.set_name,
            setCode: set.set_code,
            imageUrl: card.card_images[0].image_url,
            prices: card.card_prices?.[0],
            game: "yugioh",
            rarity: set.set_rarity,
            number: set.set_code,
          })) || [];
          setAllVersions(versions);
          setSelectedCard(versions[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function getPriceDisplay(card: CardResult) {
    if (!card.prices) return null;
    if (card.game === "onepiece") {
      return (
        <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", padding: "20px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {card.imageUrl && <img src={card.imageUrl} alt={card.name} style={{ width: "120px", borderRadius: "8px", flexShrink: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "4px" }}>{card.name}</div>
            <div style={{ fontSize: "12px", color: "#c8d8f0", marginBottom: "12px" }}>One Piece TCG · {card.set}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#0099ff", marginBottom: "12px" }}>{card.prices?.usd ? `$${card.prices.usd}` : "N/A"}</div>
            <a href={"https://www.tcgplayer.com/search/one-piece-card-game/product?q=" + encodeURIComponent(card.name)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "8px 20px", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", borderRadius: "6px", fontSize: "12px", textDecoration: "none" }}>View on TCGPlayer →</a>
          </div>
        </div>
      );
    }
    if (card.game === "magic") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {card.prices.usd && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>TCGPlayer (Normal)</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${card.prices.usd}</span>
          </div>}
          {card.prices.usd_foil && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>TCGPlayer (Foil)</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${card.prices.usd_foil}</span>
          </div>}
          {card.prices.eur && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>CardMarket</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>€{card.prices.eur}</span>
          </div>}
        </div>
      );
    }
    if (card.game === "pokemon") {
      const p = card.prices;
      const types = Object.entries(p || {});
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {types.map(([type, vals]: any) => vals?.market && (
            <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
              <span style={{ fontSize: "13px", color: "#c8d8f0", textTransform: "capitalize" }}>{type.replace(/([A-Z])/g, ' $1')}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${vals.market?.toFixed(2)}</div>
                <div style={{ fontSize: "11px", color: "#8899bb" }}>Low: ${vals.low?.toFixed(2)} · High: ${vals.high?.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (card.game === "yugioh") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {card.prices.tcgplayer_price && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>TCGPlayer</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${card.prices.tcgplayer_price}</span>
          </div>}
          {card.prices.cardmarket_price && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>CardMarket</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>€{card.prices.cardmarket_price}</span>
          </div>}
          {card.prices.ebay_price && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>eBay</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${card.prices.ebay_price}</span>
          </div>}
          {card.prices.amazon_price && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8d8f0" }}>Amazon</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#00d4ff" }}>${card.prices.amazon_price}</span>
          </div>}
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000008", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>Live Prices · All Expansions · All Versions</div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, background: "linear-gradient(135deg, #0099ff, #00d4ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Price Checker</h1>
          <p style={{ fontSize: "15px", color: "#c8d8f0" }}>Search any card — see all versions with live market prices</p>
        </div>

        {/* Game filter */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Games", icon: "🃏" },
            { id: "onepiece", label: "One Piece", icon: "🏴‍☠️" },
            { id: "pokemon", label: "Pokémon", icon: "⚡" },
            { id: "magic", label: "Magic: TG", icon: "✨" },
            { id: "yugioh", label: "Yu-Gi-Oh!", icon: "👁️" },
            { id: "dragonball", label: "Dragon Ball", icon: "🐉" },
            { id: "digimon", label: "Digimon", icon: "🎭" },
            { id: "lorcana", label: "Lorcana", icon: "🌟" },
            { id: "fab", label: "Flesh & Blood", icon: "⚔️" },
            { id: "weiss", label: "Weiss Schwarz", icon: "🎌" },
            { id: "unionarena", label: "Union Arena", icon: "🎮" },
          ].map(g => (
            <button key={g.id} onClick={() => setGame(g.id)} style={{
              padding: "8px 18px", borderRadius: "20px", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: "13px",
              border: game === g.id ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.1)",
              background: game === g.id ? "rgba(0,170,255,0.1)" : "transparent",
              color: game === g.id ? "#00d4ff" : "#c8d8f0",
            }}>{g.icon} {g.label}</button>
          ))}
        </div>

        {/* Search box */}
        <div style={{ position: "relative", marginBottom: "40px" }}>
          <div style={{ position: "relative" }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search any card... e.g. Lightning Bolt, Charizard, Dark Magician"
              style={{
                width: "100%", background: "#050515",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: showDropdown ? "12px 12px 0 0" : "12px",
                padding: "16px 50px 16px 20px",
                fontSize: "16px", color: "#ffffff",
                fontFamily: "DM Sans, sans-serif", outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(0,170,255,0.5)")}
              onBlurCapture={e => {
                setTimeout(() => setShowDropdown(false), 200);
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            />
            <div style={{
              position: "absolute", right: "16px", top: "50%",
              transform: "translateY(-50%)", color: "#8899bb", fontSize: "18px",
            }}>
              {loading ? "⏳" : "🔍"}
            </div>
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "#050515", border: "1px solid rgba(0,170,255,0.3)",
              borderTop: "none", borderRadius: "0 0 12px 12px",
              zIndex: 100, maxHeight: "320px", overflowY: "auto",
              boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => selectCard(s)}
                  style={{
                    padding: "12px 20px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "12px",
                    borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <span style={{ fontSize: "18px" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.game === "magic" ? "Magic: The Gathering" : s.game === "pokemon" ? "Pokémon TCG" : s.game === "yugioh" ? "Yu-Gi-Oh!" : s.game === "onepiece" ? "One Piece TCG" : s.game === "dragonball" ? "Dragon Ball" : s.game === "digimon" ? "Digimon" : s.game === "lorcana" ? "Lorcana" : s.game === "fab" ? "Flesh & Blood" : "TCG"}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: "11px", color: "#00d4ff" }}>View all versions →</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {selectedCard && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px", alignItems: "start" }}>

            {/* Selected card image + info */}
            <div>
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.name}
                style={{ width: "100%", borderRadius: "12px", boxShadow: "0 8px 40px rgba(0,0,0,0.7)", marginBottom: "16px" }}
              />
              <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>{selectedCard.name}</div>
                <div style={{ fontSize: "12px", color: "#00d4ff", marginBottom: "4px" }}>{selectedCard.set}</div>
                {selectedCard.rarity && <div style={{ fontSize: "11px", color: "#c8d8f0", textTransform: "capitalize" }}>⭐ {selectedCard.rarity}</div>}
              </div>
            </div>

            {/* Prices + versions */}
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "20px" }}>
                💰 Live Market Prices
              </div>
              {getPriceDisplay(selectedCard)}

              {/* All versions */}
              {allVersions.length > 1 && (
                <div style={{ marginTop: "32px" }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "16px" }}>
                    📦 All {allVersions.length} Versions / Expansions
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {allVersions.map((v, i) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedCard(v)}
                        style={{
                          cursor: "pointer",
                          border: selectedCard.id === v.id ? "2px solid #00d4ff" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "8px", overflow: "hidden",
                          width: "72px", transition: "all 0.15s",
                          opacity: selectedCard.id === v.id ? 1 : 0.6,
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                        onMouseLeave={e => {
                          if (selectedCard.id !== v.id) (e.currentTarget as HTMLDivElement).style.opacity = "0.6";
                        }}
                      >
                        <img src={v.imageUrl} alt={v.set} style={{ width: "100%", display: "block" }} />
                        <div style={{ padding: "4px 6px", background: "#0a1628", fontSize: "8px", color: "#c8d8f0", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.set}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedCard && !loading && query.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
            <p style={{ fontSize: "15px", color: "#c8d8f0", marginBottom: "32px" }}>Start typing to search any TCG card</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {["Lightning Bolt", "Charizard EX", "Blue-Eyes White Dragon", "Luffy OP-01"].map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); inputRef.current?.focus(); }} style={{
                  padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px", background: "#050515",
                  color: "#c8d8f0", fontSize: "13px", cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
