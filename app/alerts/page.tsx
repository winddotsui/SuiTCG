"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GAMES = [
  { id: "onepiece", label: "One Piece TCG", icon: "🏴‍☠️" },
  { id: "pokemon", label: "Pokémon TCG", icon: "⚡" },
  { id: "magic", label: "Magic: TG", icon: "✨" },
  { id: "yugioh", label: "Yu-Gi-Oh!", icon: "👁️" },
  { id: "lorcana", label: "Lorcana", icon: "🌟" },
  { id: "fab", label: "Flesh & Blood", icon: "⚔️" },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cardName, setCardName] = useState("");
  const [game, setGame] = useState("onepiece");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("below");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const walletAddress = typeof window !== "undefined" ? localStorage.getItem("wavetcg_wallet_address") || "anonymous" : "anonymous";

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    const { data } = await supabase
      .from("price_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  }

  async function createAlert() {
    if (!cardName.trim()) { alert("Please enter a card name"); return; }
    if (!targetPrice || parseFloat(targetPrice) <= 0) { alert("Please enter a valid target price"); return; }
    setSaving(true);
    await supabase.from("price_alerts").insert({
      user_wallet: walletAddress,
      card_name: cardName.trim(),
      game,
      target_price: parseFloat(targetPrice),
      condition,
      email: email.trim() || null,
      status: "active",
    });
    setSaved(true);
    setSaving(false);
    setCardName("");
    setTargetPrice("");
    setEmail("");
    setShowForm(false);
    setTimeout(() => setSaved(false), 3000);
    fetchAlerts();
  }

  async function deleteAlert(id: string) {
    await supabase.from("price_alerts").delete().eq("id", id);
    fetchAlerts();
  }

  async function toggleAlert(id: string, status: string) {
    await supabase.from("price_alerts").update({ status: status === "active" ? "paused" : "active" }).eq("id", id);
    fetchAlerts();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Price Tracker</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Price Alerts</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Set target prices for any TCG card — get notified when the price drops!</p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Create alert button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#ffffff" }}>
            My Alerts <span style={{ fontSize: "14px", color: "#0099ff", fontFamily: "DM Sans, sans-serif" }}>({alerts.filter(a => a.status === "active").length} active)</span>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
            + New Alert
          </button>
        </div>

        {/* Create alert form */}
        {showForm && (
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "20px" }}>Create Price Alert</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8d8f0", marginBottom: "6px" }}>Card Name *</label>
                <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. Monkey D. Luffy OP05-119"
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8d8f0", marginBottom: "6px" }}>Game *</label>
                <select value={game} onChange={e => setGame(e.target.value)}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                  {GAMES.map(g => <option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8d8f0", marginBottom: "6px" }}>Target Price ($) *</label>
                <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="e.g. 50.00" type="number" min="0"
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8d8f0", marginBottom: "6px" }}>Alert When Price Is</label>
                <select value={condition} onChange={e => setCondition(e.target.value)}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", cursor: "pointer" }}>
                  <option value="below">Below target</option>
                  <option value="above">Above target</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8d8f0", marginBottom: "6px" }}>Email (optional)</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={createAlert} disabled={saving}
                style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                {saving ? "Saving..." : saved ? "✅ Alert Created!" : "🔔 Create Alert"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: "transparent", color: "#c8d8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Alerts list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#0099ff" }}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>No alerts yet</div>
            <p style={{ fontSize: "13px", color: "#c8d8f0", marginBottom: "20px" }}>Create your first price alert to track card prices!</p>
            <button onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
              + Create Alert
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {alerts.map(alert => {
              const gameInfo = GAMES.find(g => g.id === alert.game);
              const isActive = alert.status === "active";
              return (
                <div key={alert.id} style={{ background: "#050515", border: `1px solid ${isActive ? "rgba(0,153,255,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", opacity: isActive ? 1 : 0.6 }}>
                  <div style={{ fontSize: "28px" }}>{gameInfo?.icon || "🃏"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "4px" }}>{alert.card_name}</div>
                    <div style={{ fontSize: "12px", color: "#c8d8f0" }}>{gameInfo?.label} · Alert when price is {alert.condition} <span style={{ color: "#0099ff", fontWeight: 600 }}>${alert.target_price}</span></div>
                    {alert.email && <div style={{ fontSize: "11px", color: "#444460", marginTop: "2px" }}>📧 {alert.email}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: "#0099ff", marginBottom: "6px" }}>${alert.target_price}</div>
                    <div style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 600, background: isActive ? "rgba(0,153,255,0.1)" : "rgba(255,255,255,0.05)", color: isActive ? "#0099ff" : "#444460", marginBottom: "8px", display: "inline-block" }}>
                      {isActive ? "🟢 Active" : "⏸ Paused"}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => toggleAlert(alert.id, alert.status)}
                        style={{ background: "transparent", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#0099ff", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                        {isActive ? "Pause" : "Resume"}
                      </button>
                      <button onClick={() => deleteAlert(alert.id)}
                        style={{ background: "transparent", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#ff6b6b", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div style={{ marginTop: "32px", background: "linear-gradient(135deg, #000d20, #000520)", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#0099ff", marginBottom: "8px" }}>ℹ️ How Price Alerts Work</div>
          <p style={{ fontSize: "12px", color: "#c8d8f0", lineHeight: 1.7 }}>
            Set a target price for any card. WaveTCG checks prices daily from TCGPlayer, Scryfall, and PokémonTCG API.
            When a card hits your target price, you'll see it highlighted here. Add your email to get notified directly!
          </p>
        </div>
      </div>
    </div>
  );
}
