"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GAMES = ["One Piece TCG", "Pokémon TCG", "Magic: The Gathering", "Yu-Gi-Oh!", "Flesh & Blood", "Digimon", "Lorcana", "Dragon Ball", "Weiss Schwarz", "Union Arena"];
const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];
const CONDITION_LABELS: Record<string, string> = { NM: "Near Mint", LP: "Lightly Played", MP: "Moderately Played", HP: "Heavily Played", DMG: "Damaged" };

const inputStyle = {
  width: "100%", background: "#0a1628",
  border: "1px solid rgba(0,153,255,0.15)",
  borderRadius: "8px", padding: "12px 16px",
  fontSize: "14px", color: "#ffffff",
  fontFamily: "DM Sans, sans-serif", outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block", fontSize: "11px",
  letterSpacing: "0.08em", textTransform: "uppercase" as const,
  color: "#c8d8f0", marginBottom: "8px",
};

export default function Sell() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [form, setForm] = useState({
    game: "One Piece TCG",
    name: "",
    set_name: "",
    card_number: "",
    condition: "NM",
    price_usd: "",
    quantity: "1",
    description: "",
    image_url: "",
  });
  const [cardSuggestions, setCardSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const addr = localStorage.getItem("wavetcg_wallet_address") || 
                 localStorage.getItem("connected_wallet") || "";
    setWalletAddress(addr);
    if (addr) checkProfile(addr);
    else setCheckingProfile(false);
  }, []);

  async function checkProfile(addr: string) {
    setCheckingProfile(true);
    const { data } = await supabase.from("profiles").select("*").eq("wallet_address", addr).single();
    setProfile(data);
    setCheckingProfile(false);
  }

  const hasTwitter = profile?.twitter;
  const hasDiscord = profile?.discord;
  const hasTelegram = profile?.telegram;
  const hasLinkedin = profile?.linkedin;
  const verifiedCount = [hasTwitter, hasDiscord, hasTelegram].filter(Boolean).length;
  const isVerified = verifiedCount >= 2;

  async function searchCards(q: string) {
    if (q.length < 2) { setCardSuggestions([]); setShowSuggestions(false); return; }
    const results: any[] = [];
    try {
      if (form.game === "Magic: The Gathering") {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.data) data.data.slice(0, 6).forEach((name: string) => results.push({ name }));
      } else if (form.game === "Pokémon TCG") {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=6`);
        const data = await res.json();
        if (data.data) data.data.forEach((c: any) => results.push({ name: c.name, set: c.set?.name, number: c.number }));
      } else if (form.game === "Yu-Gi-Oh!") {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=6&offset=0`);
        const data = await res.json();
        if (data.data) data.data.forEach((c: any) => results.push({ name: c.name }));
      } else if (form.game === "One Piece TCG") {
        const res = await fetch(`/api/optcg-cards?search=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.cards) data.cards.slice(0, 6).forEach((c: any) => results.push({ name: c.name, set: c.code }));
      }
    } catch {}
    setCardSuggestions(results);
    setShowSuggestions(results.length > 0);
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Please enter a card name"); return; }
    if (!form.price_usd || parseFloat(form.price_usd) <= 0) { setError("Please enter a valid price"); return; }
    setLoading(true);
    setError("");
    try {
      await supabase.from("listings").insert({
        ...form,
        price_usd: parseFloat(form.price_usd),
        quantity: parseInt(form.quantity),
        seller_address: walletAddress,
        status: "active",
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to list card");
    }
    setLoading(false);
  }

  if (checkingProfile) return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#0099ff", fontFamily: "Cinzel, serif" }}>Checking verification...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Marketplace</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>List a Card</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0" }}>Sell your cards to the WaveTCG community</p>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 12px" }}>

        {/* Verification Gate */}
        {!isVerified ? (
          <div style={{ background: "#050515", border: "1px solid rgba(255,153,0,0.3)", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>Verification Required</div>
            <p style={{ fontSize: "14px", color: "#c8d8f0", marginBottom: "24px", lineHeight: 1.7 }}>
              To list cards on WaveTCG, you need to connect at least <strong style={{ color: "#0099ff" }}>2 out of 3</strong> social accounts.
              This helps ensure legitimacy and trust in our marketplace.
            </p>

            {/* Social status */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", textAlign: "left" }}>
              {[
                { label: "Twitter / X", icon: "𝕏", connected: hasTwitter, required: true },
                { label: "Discord", icon: "💬", connected: hasDiscord, required: true },
                { label: "Telegram", icon: "✈️", connected: hasTelegram, required: true },
                { label: "LinkedIn", icon: "💼", connected: hasLinkedin, required: false },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: s.connected ? "rgba(0,255,100,0.05)" : "#0a1628", border: `1px solid ${s.connected ? "rgba(0,255,100,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{s.label}</div>
                    <div style={{ fontSize: "11px", color: s.required ? "#ff9955" : "#c8d8f0" }}>{s.required ? "Required (need 2 of 3)" : "Optional"}</div>
                  </div>
                  {s.connected
                    ? <span style={{ fontSize: "12px", color: "#00ff88", fontWeight: 600 }}>✅ Connected</span>
                    : <span style={{ fontSize: "12px", color: "#ff6b6b" }}>Not connected</span>
                  }
                </div>
              ))}
            </div>

            <div style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "20px" }}>
              You have <strong style={{ color: verifiedCount >= 2 ? "#00ff88" : "#ff9955" }}>{verifiedCount}/2</strong> required accounts connected
            </div>

            <a href="/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5"
              style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "14px 32px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans, sans-serif" }}>
              Connect Socials on Profile →
            </a>
          </div>
        ) : success ? (
          <div style={{ background: "#050515", border: "1px solid rgba(0,255,100,0.2)", borderRadius: "20px", padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#ffffff", marginBottom: "12px" }}>Card Listed!</div>
            <p style={{ fontSize: "14px", color: "#c8d8f0", marginBottom: "24px" }}>Your card is now live on the WaveTCG marketplace.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a href="/marketplace" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "12px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>View Marketplace →</a>
              <button onClick={() => { setSuccess(false); setForm({ game: "One Piece TCG", name: "", set_name: "", card_number: "", condition: "NM", price_usd: "", quantity: "1", description: "", image_url: "" }); setStep(1); }}
                style={{ background: "transparent", color: "#c8d8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                List Another Card
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", padding: "32px" }}>
            {/* Verified badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "10px 16px", background: "rgba(0,255,100,0.05)", border: "1px solid rgba(0,255,100,0.15)", borderRadius: "10px" }}>
              <span>✅</span>
              <span style={{ fontSize: "12px", color: "#00ff88" }}>Verified seller · {verifiedCount} social accounts connected</span>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: step >= s ? "linear-gradient(90deg, #0055ff, #0099ff)" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>

            {step === 1 && (
              <div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "20px" }}>Step 1 · Card Details</div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Game *</label>
                  <select value={form.game} onChange={e => setForm(p => ({ ...p, game: e.target.value }))}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: "16px", position: "relative" }}>
                  <label style={labelStyle}>Card Name *</label>
                  <input value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); searchCards(e.target.value); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for a card..."
                    style={inputStyle} />
                  {showSuggestions && cardSuggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", zIndex: 100, marginTop: "4px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                      {cardSuggestions.map((card, i) => (
                        <div key={i} onClick={() => { setForm(p => ({ ...p, name: card.name, set_name: card.set || p.set_name, card_number: card.number || p.card_number })); setShowSuggestions(false); }}
                          style={{ padding: "10px 14px", cursor: "pointer", borderBottom: i < cardSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize: "13px", color: "#ffffff" }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                          <div style={{ fontWeight: 600 }}>{card.name}</div>
                          {card.set && <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{card.set}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Set Name</label>
                    <input value={form.set_name} onChange={e => setForm(p => ({ ...p, set_name: e.target.value }))} placeholder="e.g. Romance Dawn" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input value={form.card_number} onChange={e => setForm(p => ({ ...p, card_number: e.target.value }))} placeholder="e.g. OP01-003" style={inputStyle} />
                  </div>
                </div>
                <button onClick={() => { if (!form.name.trim()) { setError("Please enter a card name"); return; } setError(""); setStep(2); }}
                  style={{ width: "100%", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                  Next →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "20px" }}>Step 2 · Condition & Price</div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Condition *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {CONDITIONS.map(c => (
                      <button key={c} onClick={() => setForm(p => ({ ...p, condition: c }))}
                        style={{ flex: 1, padding: "10px 6px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "12px", fontWeight: 600, border: form.condition === c ? "1px solid #0099ff" : "1px solid rgba(255,255,255,0.1)", background: form.condition === c ? "rgba(0,153,255,0.15)" : "transparent", color: form.condition === c ? "#0099ff" : "#c8d8f0" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: "#c8d8f0", marginTop: "6px" }}>{CONDITION_LABELS[form.condition]}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Price (USD) *</label>
                    <input value={form.price_usd} onChange={e => setForm(p => ({ ...p, price_usd: e.target.value }))} placeholder="e.g. 29.99" type="number" min="0" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="1" type="number" min="1" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Description (optional)</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Any additional details about the card..."
                    style={{ ...inputStyle, height: "80px", resize: "vertical" as const }} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: "#c8d8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Back</button>
                  <button onClick={() => { if (!form.price_usd) { setError("Please enter a price"); return; } setError(""); setStep(3); }} style={{ flex: 2, background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Next →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "20px" }}>Step 3 · Review & List</div>
                <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { label: "Card", value: form.name },
                      { label: "Game", value: form.game },
                      { label: "Set", value: form.set_name || "—" },
                      { label: "Number", value: form.card_number || "—" },
                      { label: "Condition", value: `${form.condition} · ${CONDITION_LABELS[form.condition]}` },
                      { label: "Price", value: `$${parseFloat(form.price_usd || "0").toFixed(2)} USD` },
                      { label: "Quantity", value: form.quantity },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: "10px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{item.label}</div>
                        <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {error && <div style={{ background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#ff6b6b" }}>{error}</div>}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: "transparent", color: "#c8d8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: "linear-gradient(135deg, #0055ff, #0099ff, #00ffcc)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif" }}>
                    {loading ? "Listing..." : "🚀 List Card Now"}
                  </button>
                </div>
              </div>
            )}

            {error && step !== 3 && <div style={{ marginTop: "12px", fontSize: "12px", color: "#ff6b6b" }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
