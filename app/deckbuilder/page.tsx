"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface Card {
  id: string;
  name: string;
  code: string;
  type: string;
  color: string;
  cost: number;
  power: number | null;
  set: string;
  image: string;
  rarity: string;
  effect: string | null;
  attribute: string;
}

interface DeckCard {
  card: Card;
  count: number;
}

const SETS = [
  { id: "OP01", name: "Romance Dawn" },
  { id: "OP02", name: "Paramount War" },
  { id: "OP03", name: "Pillars of Strength" },
  { id: "OP04", name: "Kingdoms of Intrigue" },
  { id: "OP05", name: "Awakening of the New Era" },
  { id: "OP06", name: "Wings of the Captain" },
  { id: "OP07", name: "500 Years in the Future" },
  { id: "OP08", name: "Two Legends" },
  { id: "OP09", name: "The Four Emperors" },
  { id: "OP10", name: "Royal Blood" },
  { id: "OP11", name: "Egghead" },
  { id: "OP12", name: "Side Character Special" },
  { id: "OP13", name: "Ultra Deck" },
  { id: "OP14", name: "The Bonds of Brothers" },
  { id: "ST01", name: "Starter Deck Straw Hat Crew" },
  { id: "ST02", name: "Starter Deck Worst Generation" },
  { id: "ST03", name: "Starter Deck The Seven Warlords" },
  { id: "ST04", name: "Starter Deck Animal Kingdom Pirates" },
  { id: "ST10", name: "Starter Deck Royal Pirates" },
];

const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];

export default function DeckBuilder() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSet, setSelectedSet] = useState("OP01");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [leader, setLeader] = useState<Card | null>(null);
  const [donCards, setDonCards] = useState(0);
  const [deckName, setDeckName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [selectedSet]);

  async function fetchCards() {
    setLoading(true);
    setCards([]);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `/api/optcg-cards?set=${selectedSet}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      const data = await res.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
      } else {
        setCards([]);
      }
    } catch (e: any) {
      console.error("Failed to fetch cards:", e);
      setCards([]);
    }
    setLoading(false);
  }

  const mainDeckCount = deck.reduce((sum, dc) => sum + dc.count, 0);

  const filteredCards = cards.filter(card => {
    const matchSearch = !search || card.name?.toLowerCase().includes(search.toLowerCase());
    const matchColor = !selectedColor || card.color?.toLowerCase().includes(selectedColor.toLowerCase());
    const matchType = !selectedType || card.type?.toLowerCase().includes(selectedType.toLowerCase());
    return matchSearch && matchColor && matchType;
  });

  function addCard(card: Card) {
    if (card.type === "LEADER") {
      setLeader(card);
      return;
    }
    const existing = deck.find(dc => dc.card.code === card.code);
    if (existing) {
      if (existing.count >= 4) return;
      setDeck(prev => prev.map(dc => dc.card.code === card.code ? { ...dc, count: dc.count + 1 } : dc));
    } else {
      if (mainDeckCount >= 50) return;
      setDeck(prev => [...prev, { card, count: 1 }]);
    }
  }

  function removeCard(cardId: string) {
    setDeck(prev => {
      const existing = prev.find(dc => dc.card.code === cardId);
      if (!existing) return prev;
      if (existing.count === 1) return prev.filter(dc => dc.card.code !== cardId);
      return prev.map(dc => dc.card.code === cardId ? { ...dc, count: dc.count - 1 } : dc);
    });
  }

  async function saveDeck() {
    if (!deckName.trim()) { alert("Please enter a deck name"); return; }
    if (!leader) { alert("Please add a Leader card"); return; }
    if (mainDeckCount !== 50) { alert(`Main deck needs exactly 50 cards (currently ${mainDeckCount})`); return; }

    setSaving(true);
    const decklist = deck.map(dc => `${dc.count}x ${dc.card.name} (${dc.card.code})`).join("\n");

    await supabase.from("saved_decks").insert({
      deck_name: deckName,
      leader_card: leader.name,
      decklist: decklist,
      card_count: mainDeckCount,
    });

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  const getCardImage = (card: Card) => {
    if (card.image) return card.image;
    return `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`;
  };

  const isComplete = leader && mainDeckCount === 50 && donCards === 10;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #1a0505 50%, #0a0a0f 100%)", padding: "40px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ff6b6b", marginBottom: "8px" }}>🏴‍☠️ WaveTCG · One Piece TCG</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#e6e4f0", marginBottom: "8px" }}>Deck Builder</h1>
        <p style={{ fontSize: "14px", color: "#888898" }}>Build your One Piece TCG deck · 1 Leader + 50 Main + 10 DON!!</p>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

        {/* LEFT — Card Browser */}
        <div>
          {/* Filters */}
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards..."
                style={{ flex: 1, minWidth: "160px", background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none" }}
              />
              <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                {SETS.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
              </select>
              <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                <option value="">All Colors</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                <option value="">All Types</option>
                <option value="LEADER">Leader</option>
                <option value="CHARACTER">Character</option>
                <option value="EVENT">Event</option>
                <option value="STAGE">Stage</option>
                <option value="DON">DON!!</option>
              </select>
            </div>
          </div>

          {/* Card Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#4da2ff" }}>Loading cards...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
              {filteredCards.map(card => {
                const inDeck = deck.find(dc => dc.card.code === card.code);
                const isLeader = card.type === "LEADER";
                return (
                  <div
                    key={card.code}
                    onClick={() => addCard(card)}
                    style={{
                      cursor: "pointer",
                      border: inDeck ? "2px solid #4da2ff" : "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#111118",
                      transition: "transform 0.15s, border-color 0.15s",
                      position: "relative",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"}
                  >
                    <img
                      src={getCardImage(card)}
                      alt={card.name}
                      style={{ width: "100%", display: "block" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/120x168/111118/888898?text=No+Image"; }}
                    />
                    {inDeck && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", background: "#4da2ff", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>
                        {inDeck.count}
                      </div>
                    )}
                    {isLeader && leader?.code === card.code && (
                      <div style={{ position: "absolute", top: "4px", left: "4px", background: "#ff3333", color: "#fff", borderRadius: "4px", padding: "2px 6px", fontSize: "9px", fontWeight: 700 }}>LDR</div>
                    )}
                    <div style={{ padding: "6px 8px", background: "#18181f" }}>
                      <div style={{ fontSize: "10px", color: "#e6e4f0", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: "9px", color: "#555562" }}>{card.code} · {card.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Deck Panel */}
        <div style={{ position: "sticky", top: "80px" }}>

          {/* Deck name */}
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <input
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              placeholder="Deck Name..."
              style={{ width: "100%", background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#e6e4f0", fontFamily: "Cinzel, serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Deck stats */}
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#e6e4f0", marginBottom: "12px" }}>Deck Status</div>
            {[
              { label: "Leader", current: leader ? 1 : 0, max: 1, color: leader ? "#4caf7d" : "#e05555" },
              { label: "Main Deck", current: mainDeckCount, max: 50, color: mainDeckCount === 50 ? "#4caf7d" : mainDeckCount > 50 ? "#e05555" : "#4da2ff" },
              { label: "DON!! Deck", current: donCards, max: 10, color: donCards === 10 ? "#4caf7d" : "#e05555" },
            ].map((stat, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#888898" }}>{stat.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: stat.color }}>{stat.current}/{stat.max}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((stat.current / stat.max) * 100, 100)}%`, background: stat.color, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}

            {/* DON!! counter */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "#888898" }}>DON!!</span>
              <button onClick={() => setDonCards(d => Math.max(0, d - 1))} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", color: "#e6e4f0", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>−</button>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", minWidth: "20px", textAlign: "center" }}>{donCards}</span>
              <button onClick={() => setDonCards(d => Math.min(10, d + 1))} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", color: "#e6e4f0", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>+</button>
            </div>
          </div>

          {/* Leader */}
          {leader && (
            <div style={{ background: "#111118", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "12px", padding: "12px", marginBottom: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <img src={getCardImage(leader)} alt={leader.name} style={{ width: "50px", borderRadius: "4px" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "#ff6b6b", marginBottom: "2px" }}>LEADER</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#e6e4f0" }}>{leader.name}</div>
                <div style={{ fontSize: "10px", color: "#888898" }}>{leader.code}</div>
              </div>
              <button onClick={() => setLeader(null)} style={{ background: "transparent", border: "none", color: "#555562", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
          )}

          {/* Deck list */}
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "12px", maxHeight: "300px", overflowY: "auto" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#e6e4f0", marginBottom: "12px" }}>Main Deck ({mainDeckCount}/50)</div>
            {deck.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#555562" }}>Click cards to add them</div>
            ) : (
              deck.map(dc => (
                <div key={dc.card.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#4da2ff", minWidth: "18px" }}>{dc.count}x</span>
                  <span style={{ fontSize: "12px", color: "#e6e4f0", flex: 1 }}>{dc.card.name}</span>
                  <span style={{ fontSize: "10px", color: "#555562" }}>{dc.card.code}</span>
                  <button onClick={() => removeCard(dc.card.code)} style={{ background: "transparent", border: "none", color: "#555562", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>−</button>
                </div>
              ))
            )}
          </div>

          {/* Save + Register buttons */}
          <button
            onClick={saveDeck}
            disabled={saving || !leader || mainDeckCount !== 50}
            style={{
              width: "100%", marginBottom: "8px",
              background: isComplete ? "linear-gradient(135deg, #1a8fe3, #4da2ff)" : "rgba(255,255,255,0.05)",
              color: isComplete ? "#fff" : "#555562",
              border: "none", borderRadius: "8px", padding: "14px",
              fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {saving ? "Saving..." : saved ? "✅ Deck Saved!" : "💾 Save Deck"}
          </button>

          <a href="/optcg" style={{
            display: "block", textAlign: "center",
            background: isComplete ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "rgba(255,255,255,0.05)",
            color: isComplete ? "#0a0a0f" : "#555562",
            border: "none", borderRadius: "8px", padding: "14px",
            fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed",
            fontFamily: "DM Sans, sans-serif", textDecoration: "none",
          }}>
            🏴‍☠️ Register for Tournament
          </a>

          {!isComplete && (
            <div style={{ fontSize: "11px", color: "#555562", textAlign: "center", marginTop: "8px" }}>
              {!leader && "Add a Leader card · "}
              {mainDeckCount !== 50 && `Main deck: ${mainDeckCount}/50 · `}
              {donCards !== 10 && `DON!!: ${donCards}/10`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}