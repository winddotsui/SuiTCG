"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import dynamic from "next/dynamic";

const WalrusUpload = dynamic(() => import("../components/WalrusUpload"), { ssr: false });

const inputStyle = {
  width: "100%", background: "#18181f",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px", padding: "12px 16px",
  fontSize: "14px", color: "#e6e4f0",
  fontFamily: "DM Sans, sans-serif", outline: "none",
};

const labelStyle = {
  display: "block", fontSize: "12px",
  letterSpacing: "0.08em", textTransform: "uppercase" as const,
  color: "#888898", marginBottom: "8px",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #1a8fe3, #4da2ff)",
  color: "#fff", border: "none", borderRadius: "8px", padding: "14px",
  fontSize: "14px", fontWeight: 500, cursor: "pointer",
  fontFamily: "DM Sans, sans-serif",
  letterSpacing: "0.05em", textTransform: "uppercase" as const,
  width: "100%",
};

const btnSecondary = {
  background: "transparent", color: "#888898",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px", padding: "14px",
  fontSize: "14px", cursor: "pointer",
  fontFamily: "DM Sans, sans-serif", width: "100%",
};

export default function Sell() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    game: "Pokémon TCG",
    name: "",
    set_name: "",
    card_number: "",
    condition: "NM",
    price_usd: "",
    price_sui: "",
    description: "",
    image_url: "",
  });

  function updateForm(key: string, val: string) {
    if (key === "price_usd" && val) {
      const sui = (parseFloat(val) / 7.28).toFixed(2);
      setForm(prev => ({ ...prev, price_usd: val, price_sui: sui }));
    } else {
      setForm(prev => ({ ...prev, [key]: val }));
    }
  }

  async function publishListing() {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.from("listings").insert({
        name: form.name,
        game: form.game,
        set_name: form.set_name,
        card_number: form.card_number,
        condition: form.condition,
        price_usd: parseFloat(form.price_usd),
        price_sui: parseFloat(form.price_sui),
        description: form.description,
        image_url: form.image_url,
        seller_address: "anonymous",
        status: "active",
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to publish listing");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "72px", marginBottom: "24px" }}>🎉</div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 700, color: "#e6e4f0", marginBottom: "12px" }}>Card Listed!</h1>
          <p style={{ fontSize: "14px", color: "#888898", marginBottom: "32px", lineHeight: 1.75 }}>
            Your card is now live on WaveTCG Marketplace!
            {form.image_url && <><br /><span style={{ color: "#4da2ff" }}>◈ Image stored on Sui Walrus</span></>}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <a href="/marketplace" style={{ ...btnPrimary, display: "inline-block", textDecoration: "none", width: "auto", padding: "12px 24px" }}>View Marketplace</a>
            <button style={{ ...btnSecondary, width: "auto", padding: "12px 24px" }} onClick={() => { setSuccess(false); setStep(1); setForm({ game: "Pokémon TCG", name: "", set_name: "", card_number: "", condition: "NM", price_usd: "", price_sui: "", description: "", image_url: "" }); }}>List Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "48px 24px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "12px" }}>Free to List · 1% on Sale · Images on Walrus</div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "36px", fontWeight: 700, color: "#e6e4f0" }}>List a Card</h1>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          {["Card Details", "Condition & Price", "Review"].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: "3px", borderRadius: "2px", marginBottom: "8px", background: step > i ? "#4da2ff" : "rgba(255,255,255,0.1)" }} />
              <div style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: step > i ? "#78bfff" : "#555562" }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "32px" }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#e6e4f0", marginBottom: "28px" }}>Card Details</h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Game</label>
                <select style={inputStyle} value={form.game} onChange={e => updateForm("game", e.target.value)}>
                  {["Pokémon TCG","Magic: The Gathering","Yu-Gi-Oh!","One Piece","Dragon Ball","Lorcana","Flesh & Blood","Digimon"].map((o,j) => <option key={j}>{o}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Card Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Charizard EX" value={form.name} onChange={e => updateForm("name", e.target.value)} />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Set / Edition</label>
                <input style={inputStyle} type="text" placeholder="e.g. Obsidian Flames" value={form.set_name} onChange={e => updateForm("set_name", e.target.value)} />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Card Number</label>
                <input style={inputStyle} type="text" placeholder="e.g. 125/197" value={form.card_number} onChange={e => updateForm("card_number", e.target.value)} />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Card Photo · Stored on Sui Walrus ◈</label>
                <WalrusUpload onUpload={(url) => updateForm("image_url", url)} />
                {form.image_url && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#4da2ff" }}>
                    ✅ Image on Walrus: {form.image_url.slice(0, 50)}...
                  </div>
                )}
              </div>

              <button style={btnPrimary} onClick={() => { if (!form.name) { setError("Please enter a card name"); return; } setError(""); setStep(2); }}>Next Step →</button>
              {error && <div style={{ color: "#e05555", fontSize: "13px", marginTop: "12px" }}>{error}</div>}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#e6e4f0", marginBottom: "28px" }}>Condition & Price</h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Condition</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["PSA 10","PSA 9","PSA 8","Mint","NM","LP","MP","HP"].map((c) => (
                    <button key={c} onClick={() => updateForm("condition", c)} style={{
                      padding: "8px 16px",
                      border: form.condition === c ? "1px solid #4da2ff" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "6px",
                      background: form.condition === c ? "rgba(77,162,255,0.1)" : "transparent",
                      color: form.condition === c ? "#78bfff" : "#888898",
                      fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Price (USD)</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={form.price_usd} onChange={e => updateForm("price_usd", e.target.value)} />
                {form.price_sui && <div style={{ fontSize: "12px", color: "#4da2ff", marginTop: "6px" }}>≈ {form.price_sui} SUI · Platform fee: 1% on sale</div>}
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Description (optional)</label>
                <textarea placeholder="Describe the card condition, shipping info..." rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={e => updateForm("description", e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
                <button style={btnPrimary} onClick={() => { if (!form.price_usd) { setError("Please enter a price"); return; } setError(""); setStep(3); }}>Review Listing →</button>
              </div>
              {error && <div style={{ color: "#e05555", fontSize: "13px", marginTop: "12px" }}>{error}</div>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#e6e4f0", marginBottom: "28px" }}>Review & Publish</h2>

              {form.image_url && (
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <img src={form.image_url} alt={form.name} style={{ width: "120px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ fontSize: "11px", color: "#4da2ff", marginTop: "6px" }}>◈ Stored on Walrus</div>
                </div>
              )}

              <div style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                {[
                  { label: "Card", val: form.name },
                  { label: "Game", val: form.game },
                  { label: "Set", val: form.set_name || "—" },
                  { label: "Condition", val: form.condition },
                  { label: "Price", val: `$${form.price_usd} USD · ${form.price_sui} SUI` },
                  { label: "Listing Fee", val: "Free" },
                  { label: "Commission", val: "1% on sale" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: "13px", color: "#888898" }}>{row.label}</span>
                    <span style={{ fontSize: "13px", color: "#e6e4f0", fontWeight: 500 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {error && <div style={{ color: "#e05555", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}

              <div style={{ display: "flex", gap: "12px" }}>
                <button style={btnSecondary} onClick={() => setStep(2)}>← Back</button>
                <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={publishListing} disabled={loading}>
                  {loading ? "Publishing..." : "🚀 Publish Listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
