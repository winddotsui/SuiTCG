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

    // Color restriction - check if card color matches leader
    if (leader && card.color) {
      const leaderColors = leader.color.split("/").map((c: string) => c.trim().toLowerCase());
      const cardColors = card.color.split("/").map((c: string) => c.trim().toLowerCase());
      const hasMatchingColor = cardColors.some((c: string) => leaderColors.includes(c));
      if (!hasMatchingColor) {
        alert(`Color mismatch! Your leader is ${leader.color}. Only ${leader.color} cards can be added.`);
        return;
      }
    }

    const existing = deck.find(dc => dc.card.code === card.code);
    if (existing) {
      if (existing.count >= 4) { alert("Max 4 copies of the same card allowed!"); return; }
      if (mainDeckCount >= 50) { alert("Main deck is full! Max 50 cards allowed."); return; }
      setDeck(prev => prev.map(dc => dc.card.code === card.code ? { ...dc, count: dc.count + 1 } : dc));
    } else {
      if (mainDeckCount >= 50) { alert("Main deck is full! Max 50 cards allowed."); return; }
      setDeck(prev => {
        const newDeck = [...prev, { card, count: 1 }];
        const newCount = newDeck.reduce((sum, dc) => sum + dc.count, 0);
        if (newCount > 50) { alert("Main deck is full! Max 50 cards allowed."); return prev; }
        return newDeck;
      });
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

    const { data } = await supabase.from("saved_decks").insert({
      deck_name: deckName,
      leader_card: leader.name,
      decklist: decklist,
      card_count: mainDeckCount,
    }).select().single();

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
    return data;
  }

  async function registerForTournament() {
    if (!deckName.trim()) { alert("Please enter a deck name"); return; }
    if (!leader) { alert("Please add a Leader card"); return; }
    if (mainDeckCount !== 50) { alert(`Main deck needs exactly 50 cards (currently ${mainDeckCount})`); return; }
    if (donCards !== 10) { alert("Please set DON!! deck to exactly 10 cards"); return; }

    setSaving(true);
    const decklist = deck.map(dc => `${dc.count}x ${dc.card.name} (${dc.card.code})`).join("\n");

    // Save deck first
    await supabase.from("saved_decks").insert({
      deck_name: deckName,
      leader_card: leader.name,
      decklist: decklist,
      card_count: mainDeckCount,
    });

    // Store deck info in localStorage for tournament registration
    localStorage.setItem("tournament_deck_name", deckName);
    localStorage.setItem("tournament_decklist", decklist);
    localStorage.setItem("tournament_leader", leader.name);

    setSaving(false);

    // Redirect to OPTCG tournament page
    window.location.href = "/optcg?register=true&deck=" + encodeURIComponent(deckName);
  }

  const getCardImage = (card: Card) => {
    if (card.image) return card.image;
    return `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`;
  };

  const isComplete = leader && mainDeckCount === 50 && donCards === 10;

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000008 50%, #000008 100%)", padding: "40px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>🏴‍☠️ WaveTCG · One Piece TCG</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #7700ff, #0099ff, #0099ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px" }}>Deck Builder</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0" }}>Build your One Piece TCG deck · 1 Leader + 50 Main + 10 DON!!</p>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

        {/* LEFT — Card Browser */}
        <div>
          {/* Filters */}
          <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards..."
                style={{ flex: 1, minWidth: "160px", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none" }}
              />
              <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                {SETS.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
              </select>
              <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                <option value="">All Colors</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
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
            <div style={{ textAlign: "center", padding: "60px", color: "#0099ff" }}>Loading cards...</div>
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
                      border: inDeck ? "2px solid #0099ff" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#050515",
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
                      <div style={{ position: "absolute", top: "4px", right: "4px", background: "#0099ff", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>
                        {inDeck.count}
                      </div>
                    )}
                    {isLeader && leader?.code === card.code && (
                      <div style={{ position: "absolute", top: "4px", left: "4px", background: "#0099ff", color: "#fff", borderRadius: "4px", padding: "2px 6px", fontSize: "9px", fontWeight: 700 }}>LDR</div>
                    )}
                    <div style={{ padding: "6px 8px", background: "#0a1628" }}>
                      <div style={{ fontSize: "10px", color: "#ffffff", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: "9px", color: "#8899bb" }}>{card.code} · {card.type}</div>
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
          <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <input
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              placeholder="Deck Name..."
              style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "Cinzel, serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Deck stats */}
          <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "12px" }}>Deck Status</div>
            {[
              { label: "Leader", current: leader ? 1 : 0, max: 1, color: leader ? "#0099ff" : "#0099ff" },
              { label: "Main Deck", current: mainDeckCount, max: 50, color: mainDeckCount === 50 ? "#0099ff" : mainDeckCount > 50 ? "#0099ff" : "#0099ff" },
              { label: "DON!! Deck", current: donCards, max: 10, color: donCards === 10 ? "#0099ff" : "#0099ff" },
            ].map((stat, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#c8d8f0" }}>{stat.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: stat.color }}>{stat.current}/{stat.max}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((stat.current / stat.max) * 100, 100)}%`, background: stat.color, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}

            {/* DON!! counter */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "#c8d8f0" }}>DON!!</span>
              <button onClick={() => setDonCards(d => Math.max(0, d - 1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>−</button>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", minWidth: "20px", textAlign: "center" }}>{donCards}</span>
              <button onClick={() => setDonCards(d => Math.min(10, d + 1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>+</button>
            </div>
          </div>

          {/* Leader */}
          {leader && (
            <div style={{ background: "#050515", border: "1px solid rgba(102,0,255,0.3)", borderRadius: "12px", padding: "12px", marginBottom: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <img src={getCardImage(leader)} alt={leader.name} style={{ width: "50px", borderRadius: "4px" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "#00d4ff", marginBottom: "2px" }}>LEADER</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ffffff" }}>{leader.name}</div>
                <div style={{ fontSize: "10px", color: "#c8d8f0" }}>{leader.code}</div>
              </div>
              <button onClick={() => setLeader(null)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
          )}

          {/* Deck list */}
          <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px", maxHeight: "300px", overflowY: "auto" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ffffff", marginBottom: "12px" }}>Main Deck ({mainDeckCount}/50)</div>
            {deck.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#8899bb" }}>Click cards to add them</div>
            ) : (
              deck.map(dc => (
                <div key={dc.card.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#0099ff", minWidth: "18px" }}>{dc.count}x</span>
                  <span style={{ fontSize: "12px", color: "#ffffff", flex: 1 }}>{dc.card.name}</span>
                  <span style={{ fontSize: "10px", color: "#8899bb" }}>{dc.card.code}</span>
                  <button onClick={() => removeCard(dc.card.code)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>−</button>
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
              background: isComplete ? "linear-gradient(135deg, #7700ff, #0099ff)" : "rgba(255,255,255,0.05)",
              color: isComplete ? "#fff" : "#8899bb",
              border: "none", borderRadius: "8px", padding: "14px",
              fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {saving ? "Saving..." : saved ? "✅ Deck Saved!" : "💾 Save Deck"}
          </button>

          <a href="/optcg" style={{
            display: "block", textAlign: "center",
            background: isComplete ? "linear-gradient(135deg, #0099ff, #00d4ff)" : "rgba(255,255,255,0.05)",
            color: isComplete ? "#000008" : "#8899bb",
            border: "none", borderRadius: "8px", padding: "14px",
            fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed",
            fontFamily: "DM Sans, sans-serif", textDecoration: "none",
          }}>
            🏴‍☠️ Register for Tournament
          </a>

          {!isComplete && (
            <div style={{ fontSize: "11px", color: "#8899bb", textAlign: "center", marginTop: "8px" }}>
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