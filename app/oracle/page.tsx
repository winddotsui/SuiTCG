"use client";
import { useState } from "react";

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
  if (!card.prices) return <div style={{ color: "#666680", fontSize: "13px" }}>No price data available</div>;
  if (card.game === "pokemon") {
    const p = card.prices;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {p["1stEditionHolofoil"] && <div style={{ fontSize: "13px", color: "#4da8ff" }}>1st Ed Holo — Market: <strong>${p["1stEditionHolofoil"].market?.toFixed(2) || "N/A"}</strong> | Low: ${p["1stEditionHolofoil"].low?.toFixed(2) || "N/A"} | High: ${p["1stEditionHolofoil"].high?.toFixed(2) || "N/A"}</div>}
        {p.holofoil && <div style={{ fontSize: "13px", color: "#4da8ff" }}>Holofoil — Market: <strong>${p.holofoil.market?.toFixed(2) || "N/A"}</strong> | Low: ${p.holofoil.low?.toFixed(2) || "N/A"} | High: ${p.holofoil.high?.toFixed(2) || "N/A"}</div>}
        {p.reverseHolofoil && <div style={{ fontSize: "13px", color: "#4da8ff" }}>Reverse Holo — Market: <strong>${p.reverseHolofoil.market?.toFixed(2) || "N/A"}</strong></div>}
        {p.normal && <div style={{ fontSize: "13px", color: "#666680" }}>Normal — Market: <strong>${p.normal.market?.toFixed(2) || "N/A"}</strong> | Low: ${p.normal.low?.toFixed(2) || "N/A"} | High: ${p.normal.high?.toFixed(2) || "N/A"}</div>}
        <div style={{ fontSize: "11px", color: "#444460", marginTop: "4px" }}>Source: TCGPlayer</div>
      </div>
    );
  }
  if (card.game === "magic") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "13px", color: "#4da8ff" }}>TCGPlayer: <strong>${card.prices.usd || "N/A"}</strong></div>
        {card.prices.usd_foil && <div style={{ fontSize: "13px", color: "#4da8ff" }}>Foil: <strong>${card.prices.usd_foil}</strong></div>}
        {card.prices.eur && <div style={{ fontSize: "13px", color: "#666680" }}>CardMarket: <strong>€{card.prices.eur}</strong></div>}
        <div style={{ fontSize: "11px", color: "#444460", marginTop: "4px" }}>Source: Scryfall</div>
      </div>
    );
  }
  if (card.game === "yugioh") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "13px", color: "#4da8ff" }}>TCGPlayer: <strong>${card.prices.tcgplayer_price || "N/A"}</strong></div>
        <div style={{ fontSize: "13px", color: "#666680" }}>CardMarket: <strong>€{card.prices.cardmarket_price || "N/A"}</strong></div>
        <div style={{ fontSize: "13px", color: "#666680" }}>eBay: <strong>${card.prices.ebay_price || "N/A"}</strong></div>
        <div style={{ fontSize: "11px", color: "#444460", marginTop: "4px" }}>Source: YGOPRODeck</div>
      </div>
    );
  }
  return <div style={{ color: "#666680", fontSize: "13px" }}>Price data coming soon</div>;
}

function CardGallery({ cards }: { cards: CardData[] }) {
  const [selected, setSelected] = useState<CardData>(cards[0]);
  if (!cards || cards.length === 0) return null;
  return (
    <div style={{ background: "#050510", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", marginTop: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444460", marginBottom: "16px" }}>{cards.length} versions found</div>
      {selected && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px", padding: "16px", background: "#0a0a18", borderRadius: "12px", border: "1px solid rgba(0,120,255,0.2)" }}>
          <img src={selected.imageLarge} alt={selected.name} style={{ width: "140px", borderRadius: "10px", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>{selected.name}</div>
            <div style={{ fontSize: "12px", color: "#444460", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{selected.set}</div>
            {selected.number && <div style={{ fontSize: "11px", color: "#444460", marginBottom: "4px" }}>#{selected.number}</div>}
            {selected.rarity && <div style={{ fontSize: "11px", color: "#4da8ff", marginBottom: "16px" }}>⭐ {selected.rarity}</div>}
            <PriceDisplay card={selected} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {cards.map((card, i) => (
          <div key={i} onClick={() => setSelected(card)} style={{ cursor: "pointer", borderRadius: "8px", overflow: "hidden", border: selected?.id === card.id ? "2px solid #0078ff" : "2px solid transparent", transition: "all 0.15s", opacity: selected?.id === card.id ? 1 : 0.7 }}>
            <img src={card.imageSmall} alt={card.name} style={{ width: "60px", display: "block" }} />
            <div style={{ fontSize: "9px", color: "#444460", textAlign: "center", padding: "2px 4px", background: "#0a0a18", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.set}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Oracle() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
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
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to Oracle." }]);
    }
    setIsLoading(false);
  }

  return (
    <div style={{ height: "calc(100vh - 60px)", background: "#000000", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#050510", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(0,120,255,0.1)", border: "1px solid rgba(0,120,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔮</div>
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>SuiTCG Oracle</div>
          <div style={{ fontSize: "12px", color: "#0078ff" }}>● Online · Pokémon · Magic · Yu-Gi-Oh! · One Piece · and more</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🔮</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>SuiTCG Oracle</h2>
            <p style={{ fontSize: "15px", color: "#666680", maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.75 }}>Ask about any TCG card — I'll show all versions with live prices.</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {["Show me all Charizard EX versions","Tell me about Black Lotus","How much is Blue-Eyes White Dragon?","Show me Monkey D. Luffy One Piece cards"].map((q,i) => (
                <button key={i} onClick={() => setInput(q)} style={{ padding: "10px 18px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", background: "#050510", color: "#666680", fontSize: "13px", cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", background: m.role === "user" ? "rgba(0,120,255,0.15)" : "rgba(0,120,255,0.15)", border: m.role === "user" ? "1px solid rgba(0,120,255,0.3)" : "1px solid rgba(0,120,255,0.3)" }}>{m.role === "user" ? "👤" : "🔮"}</div>
            <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "12px 16px", borderRadius: "12px", fontSize: "14px", lineHeight: 1.7, background: m.role === "user" ? "rgba(0,120,255,0.08)" : "#050510", border: m.role === "user" ? "1px solid rgba(0,120,255,0.15)" : "1px solid rgba(255,255,255,0.06)", color: "#ffffff", whiteSpace: "pre-wrap" }}>{m.content}</div>
              {m.cards && m.cards.length > 0 && <CardGallery cards={m.cards} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,120,255,0.15)", border: "1px solid rgba(0,120,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🔮</div>
            <div style={{ padding: "12px 16px", background: "#050510", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "#666680", fontSize: "14px" }}>Consulting the Oracle...</div>
          </div>
        )}
      </div>
      <div style={{ padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#050510", display: "flex", gap: "12px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask about any TCG card — Pokémon, Magic, Yu-Gi-Oh!, One Piece..." style={{ flex: 1, background: "#0a0a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "14px 20px", fontSize: "14px", color: "#ffffff", outline: "none" }} />
        <button onClick={sendMessage} style={{ background: "#0078ff", color: "#000000", border: "none", borderRadius: "8px", padding: "14px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}
