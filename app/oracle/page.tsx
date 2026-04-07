"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: string;
  content: string;
  cards?: any[];
}

interface CardData {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  imageSmall: string;
  imageLarge: string;
  prices: any;
  game: string;
}

function PriceDisplay({ card }: { card: CardData }) {
  if (!card.prices) return <div style={{ color: "#c8d8f0", fontSize: "12px" }}>No price data available</div>;
  if (card.game === "pokemon") {
    const p = card.prices;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {p["1stEditionHolofoil"] && <div style={{ fontSize: "12px", color: "#00d4ff" }}>1st Ed Holo — <strong>${p["1stEditionHolofoil"].market?.toFixed(2) || "N/A"}</strong></div>}
        {p.holofoil && <div style={{ fontSize: "12px", color: "#00d4ff" }}>Holofoil — <strong>${p.holofoil.market?.toFixed(2) || "N/A"}</strong></div>}
        {p.normal && <div style={{ fontSize: "12px", color: "#c8d8f0" }}>Normal — <strong>${p.normal.market?.toFixed(2) || "N/A"}</strong></div>}
        <div style={{ fontSize: "10px", color: "#444460", marginTop: "2px" }}>TCGPlayer</div>
      </div>
    );
  }
  if (card.game === "magic") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "12px", color: "#00d4ff" }}>TCGPlayer — <strong>${card.prices.usd || "N/A"}</strong></div>
        {card.prices.usd_foil && <div style={{ fontSize: "12px", color: "#00d4ff" }}>Foil — <strong>${card.prices.usd_foil}</strong></div>}
        {card.prices.eur && <div style={{ fontSize: "12px", color: "#c8d8f0" }}>CardMarket — <strong>€{card.prices.eur}</strong></div>}
        <div style={{ fontSize: "10px", color: "#444460", marginTop: "2px" }}>Scryfall</div>
      </div>
    );
  }
  if (card.game === "yugioh") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "12px", color: "#00d4ff" }}>TCGPlayer — <strong>${card.prices.tcgplayer_price || "N/A"}</strong></div>
        <div style={{ fontSize: "12px", color: "#c8d8f0" }}>CardMarket — <strong>€{card.prices.cardmarket_price || "N/A"}</strong></div>
        <div style={{ fontSize: "10px", color: "#444460", marginTop: "2px" }}>YGOPRODeck</div>
      </div>
    );
  }
  return <div style={{ color: "#c8d8f0", fontSize: "12px" }}>Price data coming soon</div>;
}

function CardGallery({ cards }: { cards: CardData[] }) {
  const [selected, setSelected] = useState<CardData>(cards[0]);
  if (!cards || cards.length === 0) return null;
  return (
    <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: "12px", padding: "14px", marginTop: "8px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444460", marginBottom: "12px" }}>{cards.length} versions found</div>
      {selected && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", padding: "12px", background: "rgba(0,212,255,0.04)", borderRadius: "10px", border: "1px solid rgba(0,212,255,0.1)" }}>
          {selected.imageLarge && <img src={selected.imageLarge} alt={selected.name} style={{ width: "70px", borderRadius: "6px", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>{selected.name}</div>
            <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "2px" }}>{selected.set}</div>
            {selected.rarity && <div style={{ fontSize: "10px", color: "#00d4ff", marginBottom: "8px" }}>⭐ {selected.rarity}</div>}
            <PriceDisplay card={selected} />
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              <a href={"https://www.tcgplayer.com/search/" + (selected.game === "magic" ? "magic" : selected.game === "yugioh" ? "yugioh" : selected.game === "onepiece" ? "one-piece-card-game" : "pokemon") + "/product?q=" + encodeURIComponent(selected.name)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", padding: "4px 10px", background: "rgba(0,153,255,0.1)", border: "1px solid rgba(0,153,255,0.25)", borderRadius: "6px", color: "#0099ff", textDecoration: "none" }}>TCGPlayer</a>
              <a href={"https://www.ebay.com/sch/i.html?_nkw=" + encodeURIComponent(selected.name + " " + selected.set + " TCG")} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", padding: "4px 10px", background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", borderRadius: "6px", color: "#ffcc00", textDecoration: "none" }}>eBay</a>
              <a href={"https://www.cardmarket.com/en/" + (selected.game === "magic" ? "Magic" : "Pokemon") + "/Products/Search?searchString=" + encodeURIComponent(selected.name)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", padding: "4px 10px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "6px", color: "#00d4ff", textDecoration: "none" }}>CardMarket</a>
              <a href={"/marketplace"} style={{ fontSize: "10px", padding: "4px 10px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "6px", color: "#00ff88", textDecoration: "none" }}>WaveTCG 🌊</a>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {cards.map((card, i) => (
          <div key={i} onClick={() => setSelected(card)} style={{ cursor: "pointer", borderRadius: "6px", overflow: "hidden", border: selected?.id === card.id ? "2px solid #00d4ff" : "2px solid transparent", opacity: selected?.id === card.id ? 1 : 0.55, transition: "all 0.15s" }}>
            <img src={card.imageSmall} alt={card.name} style={{ width: "48px", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Show me all Charizard EX versions",
  "How much is Black Lotus?",
  "Best One Piece cards to invest in?",
  "Show me Blue-Eyes White Dragon prices",
  "What's the rarest Pokémon card?",
  "Tell me about Monkey D. Luffy OP01",
];

export default function Oracle() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text?: string) {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply, cards: data.cards }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "The mystical connection was lost... Try again, seeker." }]);
    }
    setIsLoading(false);
  }

  return (
    <div style={{ height: "calc(100dvh - 56px)", background: "#000008", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        html, body { background: #000008; }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes thinking { 0%{opacity:0.2} 33%{opacity:1} 66%{opacity:0.2} 100%{opacity:0.2} }
        .msg-appear { animation: slideIn 0.25s ease both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 2px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "12px clamp(12px, 3vw, 32px)", borderBottom: "1px solid rgba(0,212,255,0.1)", background: "rgba(0,0,8,0.98)", display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.3), rgba(0,100,255,0.1))", border: "1px solid rgba(0,212,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🔮</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>TCG Oracle</div>
          <div style={{ fontSize: "11px", color: "#00d4ff", display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "pulse 2s infinite" }} />
            Online · Pokémon · Magic · Yu-Gi-Oh! · One Piece
          </div>
        </div>
        <div style={{ fontSize: "11px", color: "#444460", textAlign: "right", display: "none" }}>AI powered</div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "clamp(12px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px", animation: "float 4s ease-in-out infinite" }}>🔮</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(18px, 4vw, 28px)", color: "#ffffff", marginBottom: "8px" }}>TCG Oracle</div>
            <p style={{ fontSize: "13px", color: "#6b85a8", maxWidth: "400px", lineHeight: 1.7, marginBottom: "28px" }}>
              Ask me about any TCG card — prices, lore, investment tips, deck advice, and more across all major games.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px", width: "100%", maxWidth: "500px" }}>
              {SUGGESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  style={{ padding: "10px 14px", border: "1px solid rgba(0,212,255,0.12)", borderRadius: "10px", background: "rgba(0,212,255,0.03)", color: "#c8d8f0", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", textAlign: "left", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.35)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.07)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.03)"; }}>
                  🔮 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((m, i) => (
          <div key={i} className="msg-appear" style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: "10px", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", background: m.role === "user" ? "rgba(0,153,255,0.12)" : "radial-gradient(circle, rgba(0,212,255,0.2), rgba(0,100,255,0.05))", border: `1px solid ${m.role === "user" ? "rgba(0,153,255,0.25)" : "rgba(0,212,255,0.3)"}` }}>
              {m.role === "user" ? "👤" : "🔮"}
            </div>
            <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "10px", color: "#444460", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: m.role === "user" ? "right" : "left" }}>
                {m.role === "user" ? "You" : "Oracle"}
              </div>
              <div style={{ padding: "12px 16px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: "13px", lineHeight: 1.75, background: m.role === "user" ? "linear-gradient(135deg, rgba(0,85,255,0.18), rgba(0,153,255,0.12))" : "rgba(255,255,255,0.04)", border: m.role === "user" ? "1px solid rgba(0,153,255,0.22)" : "1px solid rgba(255,255,255,0.06)", color: "#e2eaf8", whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
              {m.cards && m.cards.length > 0 && <CardGallery cards={m.cards} />}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="msg-appear" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", background: "radial-gradient(circle, rgba(0,212,255,0.2), rgba(0,100,255,0.05))", border: "1px solid rgba(0,212,255,0.3)" }}>🔮</div>
            <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px 16px 16px 16px", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4ff", animation: `thinking 1.2s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{ padding: "12px clamp(12px, 3vw, 24px)", borderTop: "1px solid rgba(0,212,255,0.08)", background: "rgba(0,0,8,0.98)", display: "flex", gap: "8px", flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask the Oracle about any TCG card..."
          style={{ flex: 1, background: "#0a1628", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"}
          onBlur={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)"}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          style={{ padding: "11px 20px", background: isLoading || !input.trim() ? "rgba(0,212,255,0.08)" : "linear-gradient(135deg, #0055ff, #00d4ff)", color: isLoading || !input.trim() ? "#444460" : "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: isLoading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}>
          {isLoading ? "..." : "Ask →"}
        </button>
      </div>
    </div>
  );
}
