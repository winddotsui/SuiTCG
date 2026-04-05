"use client";
import { useState, useEffect } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { supabase } from "../../lib/supabase";

const GAMES = ["One Piece TCG", "Pokémon TCG", "Magic: The Gathering", "Yu-Gi-Oh!", "Flesh & Blood", "Digimon", "Lorcana", "Dragon Ball", "Weiss Schwarz", "Union Arena"];
const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];
const CONDITION_LABELS: Record<string, string> = { NM: "Near Mint", LP: "Lightly Played", MP: "Moderately Played", HP: "Heavily Played", DMG: "Damaged" };
const CONDITION_COLORS: Record<string, string> = { NM: "#00ff88", LP: "#00d4ff", MP: "#ffcc00", HP: "#ff9955", DMG: "#ff6b6b" };
const GAME_ICONS: Record<string, string> = { "One Piece TCG": "🏴‍☠️", "Pokémon TCG": "⚡", "Magic: The Gathering": "✨", "Yu-Gi-Oh!": "👁️", "Flesh & Blood": "⚔️", "Digimon": "🎭", "Dragon Ball": "🐉", "Lorcana": "🌟", "Weiss Schwarz": "🎌", "Union Arena": "🎮" };
const inputStyle = { width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "11px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#8899bb", marginBottom: "7px" };

function SellContent() {
  const currentAccount = useCurrentAccount();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({ game: "One Piece TCG", name: "", set_name: "", card_number: "", condition: "NM", price_usd: "", quantity: "1", description: "", image_url: "" });
  const [cardSuggestions, setCardSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const addr = typeof window !== "undefined" ? (localStorage.getItem("wavetcg_wallet_address") || localStorage.getItem("connected_wallet") || "") : "";
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

  const verifiedCount = [profile?.twitter, profile?.discord, profile?.telegram].filter(Boolean).length;
  const isVerified = verifiedCount >= 2;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return form.image_url;
    setUploadingImage(true);
    try {
      const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
      const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
      const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=10`, {
        method: "PUT",
        body: imageFile,
        headers: { "Content-Type": imageFile.type },
      });
      if (!res.ok) throw new Error(`Walrus upload failed: ${res.status}`);
      const json = await res.json();
      const blobId = json.newlyCreated?.blobObject?.blobId || json.alreadyCertified?.blobId;
      if (!blobId) throw new Error("No blobId returned from Walrus");
      setUploadingImage(false);
      return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
    } catch (e) {
      console.error("Walrus upload failed:", e);
      setUploadingImage(false);
      return form.image_url;
    }
  }

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
    if (!effectiveWallet) { setError("No wallet connected. Please connect your Sui wallet first."); return; }
    setLoading(true); setError("");
    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: form.name.trim(),
        game: form.game,
        set_name: form.set_name || null,
        card_number: form.card_number || null,
        condition: form.condition,
        price_usd: parseFloat(form.price_usd),
        price_sui: parseFloat((parseFloat(form.price_usd) / 7.28).toFixed(2)),
        
        description: form.description || null,
        image_url: imageUrl || null,
        seller_address: effectiveWallet,
        status: "active",
      };
      console.log("Submitting listing:", payload);
      const { data, error: insertError } = await supabase.from("listings").insert(payload).select();
      if (insertError) {
        console.error("Insert error:", insertError);
        setError(`Failed to list: ${insertError.message}`);
        setLoading(false);
        return;
      }
      console.log("Listing created:", data);
      setSuccess(true);
    } catch (e: any) {
      console.error("Submit error:", e);
      setError(e.message || "Failed to list card. Check console for details.");
    }
    setLoading(false);
  }

  function resetForm() {
    setSuccess(false);
    setImageFile(null);
    setImagePreview("");
    setForm({ game: "One Piece TCG", name: "", set_name: "", card_number: "", condition: "NM", price_usd: "", quantity: "1", description: "", image_url: "" });
    setStep(1);
  }

  const effectiveWallet = currentAccount?.address || walletAddress;

  if (checkingProfile) return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#0099ff", fontFamily: "Cinzel, serif" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <style>{`html, body { background: #000008; }`}</style>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 48px) clamp(14px, 3vw, 28px)", borderBottom: "1px solid rgba(0,153,255,0.12)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "6px" }}>◈ WaveTCG · Marketplace</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(20px, 4vw, 36px)", fontWeight: 900, background: "linear-gradient(135deg, #0099ff, #00d4ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" }}>List a Card</h1>
        <p style={{ fontSize: "12px", color: "#6b85a8" }}>Sell your cards to the WaveTCG community · 1% fee on sale</p>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px clamp(12px, 3vw, 24px)" }}>

        {/* wallet debug info */}
        {effectiveWallet && (
          <div style={{ background: "rgba(0,153,255,0.05)", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "8px 14px", marginBottom: "12px", fontSize: "11px", color: "#8899bb" }}>
            🔗 Wallet: {effectiveWallet.slice(0, 10)}...{effectiveWallet.slice(-6)}
          </div>
        )}

        <div style={{ background: "rgba(255,180,0,0.05)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "14px", flexShrink: 0 }}>🛡️</span>
          <p style={{ fontSize: "11px", color: "#c8a84b", lineHeight: 1.5, margin: 0 }}><strong>Safety Tip:</strong> Connect at least 2 social accounts to build trust with buyers.</p>
        </div>

        {!effectiveWallet ? (
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>🔌</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>Connect Your Wallet</div>
            <p style={{ fontSize: "13px", color: "#8899bb" }}>You need to connect your Sui wallet to list cards.</p>
          </div>
        ) : !isVerified ? (
          <div style={{ background: "#050515", border: "1px solid rgba(255,153,0,0.2)", borderRadius: "16px", padding: "clamp(20px, 4vw, 40px)", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔐</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "10px" }}>Verification Required</div>
            <p style={{ fontSize: "13px", color: "#8899bb", marginBottom: "20px", lineHeight: 1.6 }}>Connect at least <strong style={{ color: "#0099ff" }}>2 social accounts</strong> to list cards.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px", textAlign: "left" }}>
              {[{ label: "Twitter / X", icon: "𝕏", connected: profile?.twitter }, { label: "Discord", icon: "💬", connected: profile?.discord }, { label: "Telegram", icon: "✈️", connected: profile?.telegram }].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: s.connected ? "rgba(0,255,100,0.04)" : "#0a1628", border: `1px solid ${s.connected ? "rgba(0,255,100,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px" }}>
                  <span>{s.icon}</span>
                  <span style={{ flex: 1, fontSize: "13px", color: "#ffffff" }}>{s.label}</span>
                  <span style={{ fontSize: "11px", color: s.connected ? "#00ff88" : "#ff6b6b", fontWeight: 600 }}>{s.connected ? "✅ Connected" : "Not connected"}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "#8899bb", marginBottom: "16px" }}><strong style={{ color: verifiedCount >= 2 ? "#00ff88" : "#ff9955" }}>{verifiedCount}/2</strong> accounts connected</div>
            <a href={`/profile/${effectiveWallet}`} style={{ display: "block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Connect Socials on Profile →</a>
          </div>
        ) : success ? (
          <div style={{ background: "#050515", border: "1px solid rgba(0,255,100,0.2)", borderRadius: "16px", padding: "clamp(32px, 6vw, 60px)", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#ffffff", marginBottom: "10px" }}>Card Listed!</div>
            <p style={{ fontSize: "13px", color: "#8899bb", marginBottom: "28px" }}>Your card is now live on the WaveTCG marketplace.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/marketplace" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "11px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>View Marketplace →</a>
              <button onClick={resetForm} style={{ background: "transparent", color: "#c8d8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "11px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>List Another Card</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "clamp(16px, 4vw, 32px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", padding: "8px 14px", background: "rgba(0,255,100,0.04)", border: "1px solid rgba(0,255,100,0.12)", borderRadius: "8px" }}>
              <span>✅</span>
              <span style={{ fontSize: "11px", color: "#00ff88" }}>Verified seller · {verifiedCount} social accounts connected</span>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                {["Card Details", "Pricing", "Review"].map((label, i) => (
                  <div key={i} style={{ fontSize: "10px", color: step > i + 1 ? "#00ff88" : step === i + 1 ? "#0099ff" : "#444460", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: step === i + 1 ? 600 : 400 }}>{step > i + 1 ? "✓ " : `${i + 1}. `}{label}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3].map(s => (<div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: step >= s ? "linear-gradient(90deg, #0055ff, #0099ff)" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />))}
              </div>
            </div>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>Card Details</div>
                <div>
                  <label style={labelStyle}>Game *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "6px" }}>
                    {GAMES.map(g => (
                      <button key={g} onClick={() => setForm(p => ({ ...p, game: g }))} style={{ padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "11px", fontWeight: 500, border: form.game === g ? "1px solid #0099ff" : "1px solid rgba(255,255,255,0.08)", background: form.game === g ? "rgba(0,153,255,0.12)" : "transparent", color: form.game === g ? "#0099ff" : "#8899bb", textAlign: "left", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{GAME_ICONS[g] || "🃏"}</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.split(":")[0].split(" ").slice(0, 2).join(" ")}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>Card Name *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); searchCards(e.target.value); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder={`Search ${form.game} cards...`} style={inputStyle} />
                  {showSuggestions && cardSuggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", zIndex: 100, marginTop: "4px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", overflow: "hidden" }}>
                      {cardSuggestions.map((card, i) => (
                        <div key={i} onClick={() => { setForm(p => ({ ...p, name: card.name, set_name: card.set || p.set_name, card_number: card.number || p.card_number })); setShowSuggestions(false); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: i < cardSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{card.name}</div>
                          {card.set && <div style={{ fontSize: "10px", color: "#8899bb" }}>{card.set}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div><label style={labelStyle}>Set Name</label><input value={form.set_name} onChange={e => setForm(p => ({ ...p, set_name: e.target.value }))} placeholder="e.g. Romance Dawn" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Card Number</label><input value={form.card_number} onChange={e => setForm(p => ({ ...p, card_number: e.target.value }))} placeholder="e.g. OP01-003" style={inputStyle} /></div>
                </div>

                {/* Image upload */}
                <div>
                  <label style={labelStyle}>Card Image</label>
                  <div style={{ border: "2px dashed rgba(0,153,255,0.2)", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: imagePreview ? "transparent" : "#0a1628", position: "relative" }}
                    onClick={() => document.getElementById("card-image-upload")?.click()}
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onload = ev => setImagePreview(ev.target?.result as string); reader.readAsDataURL(file); } }}>
                    {imagePreview ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <img src={imagePreview} alt="preview" style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(0,153,255,0.3)" }} />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "12px", color: "#00ff88", marginBottom: "4px" }}>✅ Image selected</div>
                          <div style={{ fontSize: "11px", color: "#8899bb" }}>{imageFile?.name}</div>
                          <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(""); }} style={{ marginTop: "6px", fontSize: "10px", color: "#ff6b6b", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📸</div>
                        <div style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "4px" }}>Click or drag to upload card image</div>
                        <div style={{ fontSize: "11px", color: "#444460" }}>JPG, PNG, WEBP · Max 5MB</div>
                      </div>
                    )}
                    <input id="card-image-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <label style={{ ...labelStyle, marginBottom: "4px" }}>Or paste image URL</label>
                    <input value={form.image_url} onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); if (e.target.value) setImagePreview(e.target.value); }} placeholder="https://..." style={inputStyle} />
                  </div>
                </div>

                {error && <div style={{ fontSize: "12px", color: "#ff6b6b", padding: "8px 12px", background: "rgba(255,50,50,0.06)", borderRadius: "6px" }}>{error}</div>}
                <button onClick={() => { if (!form.name.trim()) { setError("Please enter a card name"); return; } setError(""); setStep(2); }} style={{ width: "100%", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Next → Pricing</button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>Condition & Pricing</div>
                <div>
                  <label style={labelStyle}>Condition *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "8px" }}>
                    {CONDITIONS.map(c => (<button key={c} onClick={() => setForm(p => ({ ...p, condition: c }))} style={{ padding: "10px 4px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "12px", fontWeight: 700, border: form.condition === c ? `1px solid ${CONDITION_COLORS[c]}` : "1px solid rgba(255,255,255,0.08)", background: form.condition === c ? `${CONDITION_COLORS[c]}15` : "transparent", color: form.condition === c ? CONDITION_COLORS[c] : "#8899bb", textAlign: "center" }}>{c}</button>))}
                  </div>
                  <div style={{ fontSize: "11px", color: CONDITION_COLORS[form.condition], padding: "6px 10px", background: `${CONDITION_COLORS[form.condition]}10`, borderRadius: "6px", display: "inline-block" }}>{CONDITION_LABELS[form.condition]}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Price (USD) *</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8899bb", fontSize: "14px" }}>$</span>
                      <input value={form.price_usd} onChange={e => setForm(p => ({ ...p, price_usd: e.target.value }))} placeholder="0.00" type="number" min="0" style={{ ...inputStyle, paddingLeft: "28px" }} />
                    </div>
                    {form.price_usd && <div style={{ fontSize: "10px", color: "#8899bb", marginTop: "4px" }}>≈ {(parseFloat(form.price_usd) / 7.28).toFixed(2)} SUI</div>}
                  </div>
                  <div><label style={labelStyle}>Quantity</label><input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="1" type="number" min="1" style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>Description (optional)</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Any additional details..." style={{ ...inputStyle, height: "80px", resize: "vertical" as const }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0a1628", borderRadius: "8px" }}><span style={{ fontSize: "12px", color: "#8899bb" }}>Platform fee</span><span style={{ fontSize: "12px", color: "#0099ff" }}>1% on sale</span></div>
                {form.price_usd && parseFloat(form.price_usd) > 0 && (<div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(0,255,136,0.04)", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.1)" }}><span style={{ fontSize: "12px", color: "#8899bb" }}>You receive</span><span style={{ fontSize: "13px", color: "#00ff88", fontWeight: 600 }}>${(parseFloat(form.price_usd) * 0.99).toFixed(2)}</span></div>)}
                {error && <div style={{ fontSize: "12px", color: "#ff6b6b", padding: "8px 12px", background: "rgba(255,50,50,0.06)", borderRadius: "6px" }}>{error}</div>}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: "#8899bb", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "13px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Back</button>
                  <button onClick={() => { if (!form.price_usd || parseFloat(form.price_usd) <= 0) { setError("Please enter a valid price"); return; } setError(""); setStep(3); }} style={{ flex: 2, background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Next → Review</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>Review & List</div>
                <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  {(imagePreview || form.image_url) && <div style={{ width: "60px", height: "80px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}><img src={imagePreview || form.image_url} alt={form.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "4px" }}>{form.name}</div>
                    <div style={{ fontSize: "12px", color: "#8899bb", marginBottom: "8px" }}>{GAME_ICONS[form.game]} {form.game}{form.set_name ? ` · ${form.set_name}` : ""}{form.card_number ? ` · ${form.card_number}` : ""}</div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: CONDITION_COLORS[form.condition], padding: "2px 8px", background: `${CONDITION_COLORS[form.condition]}12`, borderRadius: "4px" }}>{form.condition}</span>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: "#0099ff" }}>${parseFloat(form.price_usd || "0").toFixed(2)}</span>
                      {parseInt(form.quantity) > 1 && <span style={{ fontSize: "11px", color: "#8899bb" }}>×{form.quantity}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[["Listing price", `$${parseFloat(form.price_usd || "0").toFixed(2)}`], ["Platform fee (1%)", `-$${(parseFloat(form.price_usd || "0") * 0.01).toFixed(2)}`], ["You receive", `$${(parseFloat(form.price_usd || "0") * 0.99).toFixed(2)}`]].map(([label, val], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < 2 ? "10px" : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span style={{ fontSize: "12px", color: "#8899bb" }}>{label}</span>
                      <span style={{ fontSize: "12px", fontWeight: i === 2 ? 700 : 400, color: i === 2 ? "#00ff88" : "#c8d8f0" }}>{val}</span>
                    </div>
                  ))}
                </div>
                {error && <div style={{ fontSize: "12px", color: "#ff6b6b", padding: "10px 14px", background: "rgba(255,50,50,0.06)", borderRadius: "8px", border: "1px solid rgba(255,50,50,0.15)" }}>{error}</div>}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: "transparent", color: "#8899bb", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "13px", fontSize: "14px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: loading ? "rgba(0,153,255,0.3)" : "linear-gradient(135deg, #0055ff, #0099ff, #00ffcc)", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif" }}>
                    {loading ? (uploadingImage ? "Uploading image..." : "Listing...") : "🚀 List Card Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sell() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <SellContent />;
}
