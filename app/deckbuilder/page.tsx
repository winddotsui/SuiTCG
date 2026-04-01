"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface Card {
  id: string; name: string; code: string; type: string;
  color: string; cost: number; power: number | null;
  set: string; image: string; rarity: string;
  effect: string | null; attribute: string;
}
interface DeckCard { card: Card; count: number; }

const SETS = [
  { id: "OP01", name: "Romance Dawn" }, { id: "OP02", name: "Paramount War" },
  { id: "OP03", name: "Pillars of Strength" }, { id: "OP04", name: "Kingdoms of Intrigue" },
  { id: "OP05", name: "Awakening" }, { id: "OP06", name: "Wings of Captain" },
  { id: "OP07", name: "500 Years Future" }, { id: "OP08", name: "Two Legends" },
  { id: "OP09", name: "Four Emperors" }, { id: "OP10", name: "Royal Blood" },
  { id: "ST01", name: "Straw Hat Crew" }, { id: "ST02", name: "Worst Generation" },
];
const COLORS = ["Red","Blue","Green","Purple","Black","Yellow"];

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
  const [showDeckList, setShowDeckList] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", () => setIsMobile(window.innerWidth <= 768));
  }, []);

  useEffect(() => { fetchCards(); }, [selectedSet]);

  // Auto filter by leader color
  useEffect(() => {
    if (leader?.color) {
      const leaderColor = leader.color.split("/")[0].trim();
      setSelectedColor(leaderColor);
    }
  }, [leader]);

  async function fetchCards() {
    setLoading(true);
    setCards([]);
    try {
      const res = await fetch(`/api/optcg-cards?set=${selectedSet}`);
      const data = await res.json();
      setCards(data.cards || []);
    } catch { setCards([]); }
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
    if (card.type === "LEADER") { setLeader(card); return; }
    if (leader && card.color) {
      const leaderColors = leader.color.split("/").map((c:string) => c.trim().toLowerCase());
      const cardColors = card.color.split("/").map((c:string) => c.trim().toLowerCase());
      if (!cardColors.some((c:string) => leaderColors.includes(c))) {
        alert(`Color mismatch! Leader is ${leader.color}`); return;
      }
    }
    const existing = deck.find(dc => dc.card.code === card.code);
    if (existing) {
      if (existing.count >= 4) { alert("Max 4 copies!"); return; }
      if (mainDeckCount >= 50) { alert("Deck full! Max 50 cards."); return; }
      setDeck(prev => prev.map(dc => dc.card.code === card.code ? {...dc, count: dc.count+1} : dc));
    } else {
      if (mainDeckCount >= 50) { alert("Deck full! Max 50 cards."); return; }
      setDeck(prev => [...prev, {card, count:1}]);
    }
  }

  function removeCard(code: string) {
    setDeck(prev => {
      const existing = prev.find(dc => dc.card.code === code);
      if (!existing) return prev;
      if (existing.count === 1) return prev.filter(dc => dc.card.code !== code);
      return prev.map(dc => dc.card.code === code ? {...dc, count: dc.count-1} : dc);
    });
  }

  async function saveDeck() {
    if (!deckName.trim()) { alert("Enter deck name"); return; }
    if (!leader) { alert("Add a Leader"); return; }
    if (mainDeckCount !== 50) { alert(`Need 50 cards (${mainDeckCount}/50)`); return; }
    setSaving(true);
    const decklist = deck.map(dc => `${dc.count}x ${dc.card.name} (${dc.card.code})`).join("\n");
    await supabase.from("saved_decks").insert({deck_name:deckName, leader_card:leader.name, decklist, card_count:mainDeckCount});
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function registerForTournament() {
    if (!deckName.trim()) { alert("Enter deck name"); return; }
    if (!leader) { alert("Add a Leader"); return; }
    if (mainDeckCount !== 50) { alert(`Need 50 cards (${mainDeckCount}/50)`); return; }
    if (donCards !== 10) { alert("Set DON!! to 10"); return; }
    setSaving(true);
    const decklist = deck.map(dc => `${dc.count}x ${dc.card.name} (${dc.card.code})`).join("\n");
    await supabase.from("saved_decks").insert({deck_name:deckName, leader_card:leader.name, decklist, card_count:mainDeckCount});
    localStorage.setItem("tournament_deck_name", deckName);
    localStorage.setItem("tournament_decklist", decklist);
    localStorage.setItem("tournament_leader", leader?.name || "");
    setSaving(false);
    window.location.href = "/optcg?register=true&deck=" + encodeURIComponent(deckName);
  }

  const getCardImage = (card: Card) =>
    card.image || `https://en.onepiece-cardgame.com/images/cardlist/card/${card.code}.png`;

  const isComplete = leader && mainDeckCount === 50 && donCards === 10;

  return (
    <div style={{ minHeight: "100vh", background: "#000008", paddingBottom: isMobile ? "280px" : "0" }}>
      {/* Header */}
      <div style={{ padding: "24px 16px 16px", borderBottom: "1px solid rgba(0,153,255,0.1)", textAlign: "center" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "6px" }}>🏴‍☠️ WaveTCG · One Piece TCG</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 5vw, 42px)", fontWeight: 900, background: "linear-gradient(135deg, #7700ff, #0099ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "4px" }}>Deck Builder</h1>
        <p style={{ fontSize: "12px", color: "#c8d8f0" }}>1 Leader + 50 Main + 10 DON!!</p>
      </div>

      {/* MOBILE LAYOUT */}
      {isMobile ? (
        <div style={{ padding: "12px" }}>
          {/* Filters */}
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cards..."
              style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box", marginBottom: "8px" }} />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)}
                style={{ flex: 1, minWidth: "120px", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 8px", fontSize: "12px", color: "#ffffff", outline: "none" }}>
                {SETS.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
              <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)}
                style={{ flex: 1, minWidth: "90px", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 8px", fontSize: "12px", color: "#ffffff", outline: "none" }}>
                <option value="">All Colors</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                style={{ flex: 1, minWidth: "90px", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 8px", fontSize: "12px", color: "#ffffff", outline: "none" }}>
                <option value="">All Types</option>
                <option value="LEADER">Leader</option>
                <option value="CHARACTER">Character</option>
                <option value="EVENT">Event</option>
                <option value="STAGE">Stage</option>
              </select>
            </div>
            {leader && (
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#0099ff", background: "rgba(0,153,255,0.1)", padding: "4px 8px", borderRadius: "6px" }}>
                🎯 Showing {leader.color} cards for {leader.name}
                <button onClick={() => setSelectedColor("")} style={{ marginLeft: "8px", background: "transparent", border: "none", color: "#c8d8f0", cursor: "pointer", fontSize: "11px" }}>Show All</button>
              </div>
            )}
          </div>

          {/* 4-col card grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
              {filteredCards.map(card => {
                const inDeck = deck.find(dc => dc.card.code === card.code);
                return (
                  <div key={card.code} onClick={() => addCard(card)} style={{
                    cursor: "pointer", borderRadius: "6px", overflow: "hidden",
                    border: inDeck ? "2px solid #0099ff" : "1px solid rgba(255,255,255,0.06)",
                    background: "#050515", position: "relative",
                  }}>
                    <img src={getCardImage(card)} alt={card.name}
                      style={{ width: "100%", display: "block", aspectRatio: "0.72" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/80x112/111118/888898?text=?"; }} />
                    {inDeck && (
                      <div style={{ position: "absolute", top: "2px", right: "2px", background: "#0099ff", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>
                        {inDeck.count}
                      </div>
                    )}
                    <div style={{ padding: "3px 4px", background: "#0a1628" }}>
                      <div style={{ fontSize: "8px", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP LAYOUT */
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          {/* LEFT */}
          <div>
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cards..."
                  style={{ flex: 1, minWidth: "160px", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", outline: "none", cursor: "pointer" }}>
                  {SETS.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
                </select>
                <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", outline: "none", cursor: "pointer" }}>
                  <option value="">All Colors</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", outline: "none", cursor: "pointer" }}>
                  <option value="">All Types</option>
                  <option value="LEADER">Leader</option>
                  <option value="CHARACTER">Character</option>
                  <option value="EVENT">Event</option>
                  <option value="STAGE">Stage</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#0099ff" }}>Loading cards...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
                {filteredCards.map(card => {
                  const inDeck = deck.find(dc => dc.card.code === card.code);
                  return (
                    <div key={card.code} onClick={() => addCard(card)}
                      style={{ cursor: "pointer", border: inDeck ? "2px solid #0099ff" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden", background: "#050515", position: "relative" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"}>
                      <img src={getCardImage(card)} alt={card.name} style={{ width: "100%", display: "block" }}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/120x168/111118/888898?text=?"; }} />
                      {inDeck && (
                        <div style={{ position: "absolute", top: "4px", right: "4px", background: "#0099ff", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>{inDeck.count}</div>
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

          {/* RIGHT */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <input value={deckName} onChange={e => setDeckName(e.target.value)} placeholder="Deck Name..."
                style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "Cinzel, serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "12px" }}>Deck Status</div>
              {[
                { label: "Leader", current: leader ? 1 : 0, max: 1 },
                { label: "Main Deck", current: mainDeckCount, max: 50 },
                { label: "DON!! Deck", current: donCards, max: 10 },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#c8d8f0" }}>{s.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#0099ff" }}>{s.current}/{s.max}</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((s.current/s.max)*100,100)}%`, background: "#0099ff", transition: "width 0.3s" }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "#c8d8f0" }}>DON!! Deck</span>
                <button onClick={() => setDonCards(d => Math.max(0,d-1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", width: "24px", height: "24px", cursor: "pointer", fontSize: "14px" }}>−</button>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#fff", minWidth: "20px", textAlign: "center" }}>{donCards}</span>
                <button onClick={() => setDonCards(d => Math.min(10,d+1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", width: "24px", height: "24px", cursor: "pointer", fontSize: "14px" }}>+</button>
              </div>
            </div>
            {leader && (
              <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.3)", borderRadius: "12px", padding: "12px", marginBottom: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                <img src={getCardImage(leader)} alt={leader.name} style={{ width: "50px", borderRadius: "4px" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#00d4ff", marginBottom: "2px" }}>LEADER</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#fff" }}>{leader.name}</div>
                </div>
                <button onClick={() => setLeader(null)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer", fontSize: "16px" }}>✕</button>
              </div>
            )}
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "12px", maxHeight: "300px", overflowY: "auto" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#fff", marginBottom: "12px" }}>Main Deck ({mainDeckCount}/50)</div>
              {deck.length === 0 ? <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#8899bb" }}>Click cards to add</div> : deck.map(dc => (
                <div key={dc.card.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#0099ff", minWidth: "18px" }}>{dc.count}x</span>
                  <span style={{ fontSize: "12px", color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dc.card.name}</span>
                  <button onClick={() => removeCard(dc.card.code)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer", fontSize: "14px" }}>−</button>
                </div>
              ))}
            </div>
            <button onClick={saveDeck} disabled={saving || !isComplete}
              style={{ width: "100%", marginBottom: "8px", background: isComplete ? "linear-gradient(135deg, #7700ff, #0099ff)" : "rgba(255,255,255,0.05)", color: isComplete ? "#fff" : "#8899bb", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed", fontFamily: "DM Sans, sans-serif" }}>
              {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save Deck"}
            </button>
            <button onClick={registerForTournament} disabled={saving || !isComplete}
              style={{ width: "100%", background: isComplete ? "linear-gradient(135deg, #0099ff, #00d4ff)" : "rgba(255,255,255,0.05)", color: isComplete ? "#000008" : "#8899bb", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed", fontFamily: "DM Sans, sans-serif" }}>
              🏴‍☠️ Register for Tournament
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM PANEL */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000, background: "#000010", borderTop: "2px solid rgba(0,153,255,0.3)", boxShadow: "0 -8px 32px rgba(0,0,0,0.9)" }}>
          {/* Toggle deck list */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(0,153,255,0.15)" }}>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
              <span style={{ color: leader ? "#0099ff" : "#444460" }}>Leader: {leader ? "✅" : "—"}</span>
              <span style={{ color: mainDeckCount === 50 ? "#00ff88" : "#0099ff" }}>Deck: {mainDeckCount}/50</span>
              <span style={{ color: donCards === 10 ? "#00ff88" : "#0099ff" }}>DON: {donCards}/10</span>
            </div>
            <button onClick={() => setShowDeckList(!showDeckList)} style={{ background: "rgba(0,153,255,0.1)", border: "1px solid rgba(0,153,255,0.3)", borderRadius: "6px", color: "#0099ff", fontSize: "11px", padding: "4px 10px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
              {showDeckList ? "Hide ▼" : "Deck ▲"}
            </button>
          </div>

          {/* Deck name + DON + buttons */}
          <div style={{ padding: "8px 12px" }}>
            <input value={deckName} onChange={e => setDeckName(e.target.value)} placeholder="Deck Name..."
              style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#ffffff", fontFamily: "Cinzel, serif", outline: "none", boxSizing: "border-box", marginBottom: "8px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "#c8d8f0" }}>DON!!</span>
              <button onClick={() => setDonCards(d => Math.max(0,d-1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px" }}>−</button>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#0099ff", minWidth: "24px", textAlign: "center" }}>{donCards}</span>
              <button onClick={() => setDonCards(d => Math.min(10,d+1))} style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px" }}>+</button>
              <div style={{ flex: 1, display: "flex", gap: "6px" }}>
                <button onClick={saveDeck} disabled={saving || !isComplete}
                  style={{ flex: 1, background: isComplete ? "linear-gradient(135deg, #7700ff, #0099ff)" : "rgba(255,255,255,0.05)", color: isComplete ? "#fff" : "#444460", border: "none", borderRadius: "6px", padding: "8px", fontSize: "11px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed" }}>
                  {saved ? "✅" : "💾 Save"}
                </button>
                <button onClick={registerForTournament} disabled={saving || !isComplete}
                  style={{ flex: 1, background: isComplete ? "linear-gradient(135deg, #0099ff, #00d4ff)" : "rgba(255,255,255,0.05)", color: isComplete ? "#000" : "#444460", border: "none", borderRadius: "6px", padding: "8px", fontSize: "11px", fontWeight: 600, cursor: isComplete ? "pointer" : "not-allowed" }}>
                  🏴‍☠️ Register
                </button>
              </div>
            </div>
          </div>

          {/* Expandable deck list */}
          {showDeckList && (
            <div style={{ maxHeight: "200px", overflowY: "auto", padding: "8px 12px", borderTop: "1px solid rgba(0,153,255,0.1)" }}>
              {leader && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", borderBottom: "1px solid rgba(0,153,255,0.1)", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "#00d4ff" }}>LEADER</span>
                  <span style={{ fontSize: "12px", color: "#fff", flex: 1 }}>{leader.name}</span>
                  <button onClick={() => setLeader(null)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer" }}>✕</button>
                </div>
              )}
              {deck.length === 0 ? (
                <div style={{ textAlign: "center", padding: "12px", fontSize: "12px", color: "#444460" }}>Tap cards above to add</div>
              ) : deck.map(dc => (
                <div key={dc.card.code} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "12px", color: "#0099ff", minWidth: "16px" }}>{dc.count}x</span>
                  <span style={{ fontSize: "11px", color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dc.card.name}</span>
                  <button onClick={() => removeCard(dc.card.code)} style={{ background: "transparent", border: "none", color: "#8899bb", cursor: "pointer", fontSize: "14px" }}>−</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
