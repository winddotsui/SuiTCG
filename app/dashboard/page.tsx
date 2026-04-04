"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const tabs = ["Overview", "My Listings", "My Alerts", "My Decks", "Tournaments", "Wallet"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const walletAddress = typeof window !== "undefined"
    ? localStorage.getItem("wavetcg_wallet_address") || null
    : null;

  const shortAddr = (addr: string) => addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "—";

  useEffect(() => {
    if (walletAddress) fetchAll();
    else setLoading(false);
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [profileRes, listingsRes, alertsRes, decksRes, tournamentsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("wallet_address", walletAddress).single(),
        supabase.from("listings").select("*").eq("seller_address", walletAddress).order("created_at", { ascending: false }),
        supabase.from("price_alerts").select("*").eq("user_wallet", walletAddress).order("created_at", { ascending: false }),
        supabase.from("saved_decks").select("*").eq("wallet_address", walletAddress).order("created_at", { ascending: false }),
        supabase.from("tournament_registrations").select("*").eq("wallet_address", walletAddress).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (listingsRes.data) setListings(listingsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (decksRes.data) setDecks(decksRes.data);
      if (tournamentsRes.data) setTournaments(tournamentsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function deleteListing(id: string) {
    await supabase.from("listings").delete().eq("id", id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  async function toggleListing(id: string, status: string) {
    const newStatus = status === "active" ? "paused" : "active";
    await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  }

  async function deleteAlert(id: string) {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  const activeListings = listings.filter(l => l.status === "active");
  const totalValue = listings.reduce((sum, l) => sum + (l.price_usd || 0), 0);
  const activeAlerts = alerts.filter(a => a.status === "active");

  if (!walletAddress) return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "48px" }}>🔒</div>
      <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#ffffff" }}>Connect Your Wallet</div>
      <p style={{ fontSize: "13px", color: "#8899bb" }}>Connect your Sui wallet to view your dashboard</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000008", padding: "20px 12px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "6px" }}>My Account</div>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, background: "linear-gradient(135deg, #0030cc, #0099ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px" }}>
              {profile?.username || "Dashboard"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#c8d8f0", fontFamily: "monospace" }}>{shortAddr(walletAddress)}</span>
              {profile?.twitter && <span style={{ fontSize: "11px", color: "#1da1f2" }}>𝕏 @{profile.twitter}</span>}
            </div>
          </div>
          <a href="/sell" style={{ background: "#0099ff", color: "#000008", padding: "10px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "inline-block", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            + List a Card
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Active Listings", val: activeListings.length.toString(), sub: `${listings.length} total`, color: "#0099ff" },
            { label: "Price Alerts", val: activeAlerts.length.toString(), sub: `${alerts.length} total`, color: "#00d4ff" },
            { label: "Saved Decks", val: decks.length.toString(), sub: "in deck builder", color: "#00ffcc" },
            { label: "Tournaments", val: tournaments.length.toString(), sub: "registered", color: "#0099ff" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8899bb", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 600, color: s.color, marginBottom: "2px" }}>
                {loading ? "..." : s.val}
              </div>
              <div style={{ fontSize: "11px", color: "#444460" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "12px", fontWeight: 500, border: activeTab === tab ? "1px solid #0099ff" : "1px solid rgba(255,255,255,0.08)", background: activeTab === tab ? "rgba(0,153,255,0.12)" : "transparent", color: activeTab === tab ? "#0099ff" : "#8899bb", whiteSpace: "nowrap", flexShrink: 0 }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Profile card */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "14px" }}>Profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                {[
                  ["Username", profile?.username || "—"],
                  ["Twitter", profile?.twitter ? "@" + profile.twitter : "—"],
                  ["Discord", profile?.discord || "—"],
                  ["Telegram", profile?.telegram || "—"],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: "#0a1628", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", color: "#8899bb", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontSize: "12px", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</div>
                  </div>
                ))}
              </div>
              <a href="/profile" style={{ display: "inline-block", marginTop: "12px", fontSize: "11px", color: "#0099ff", textDecoration: "none" }}>Edit Profile →</a>
            </div>

            {/* Recent listings */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "14px" }}>Recent Listings</div>
              {loading ? (
                <div style={{ color: "#0099ff", fontSize: "13px" }}>Loading...</div>
              ) : listings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "#8899bb", fontSize: "13px" }}>
                  No listings yet — <a href="/sell" style={{ color: "#0099ff" }}>list your first card</a>
                </div>
              ) : listings.slice(0, 4).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < Math.min(listings.length, 4) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, overflow: "hidden" }}>
                    {item.image_url ? <img src={item.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🃏"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0099ff" }}>${item.price_usd}</div>
                    <div style={{ fontSize: "10px", color: item.status === "active" ? "#00ff88" : "#8899bb" }}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent alerts */}
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff", marginBottom: "14px" }}>Active Price Alerts</div>
              {loading ? (
                <div style={{ color: "#0099ff", fontSize: "13px" }}>Loading...</div>
              ) : activeAlerts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "#8899bb", fontSize: "13px" }}>
                  No alerts — <a href="/alerts" style={{ color: "#0099ff" }}>create one</a>
                </div>
              ) : activeAlerts.slice(0, 3).map((alert, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < Math.min(activeAlerts.length, 3) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{alert.card_name}</div>
                    <div style={{ fontSize: "11px", color: "#8899bb" }}>{alert.game} · {alert.condition} ${alert.target_price}</div>
                  </div>
                  <div style={{ fontSize: "10px", color: "#00ff88" }}>🟢 Active</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MY LISTINGS ── */}
        {activeTab === "My Listings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🃏</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>No listings yet</div>
                <a href="/sell" style={{ color: "#0099ff", fontSize: "13px" }}>+ List your first card</a>
              </div>
            ) : listings.map((item, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, overflow: "hidden" }}>
                  {item.image_url ? <img src={item.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🃏"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{item.game} · {item.condition} · {item.set_name}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0099ff" }}>${item.price_usd}</div>
                  <div style={{ fontSize: "10px", color: "#8899bb" }}>{item.price_sui} SUI</div>
                  <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: item.status === "active" ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", color: item.status === "active" ? "#00ff88" : "#8899bb", marginTop: "3px", display: "inline-block" }}>{item.status}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                  <button onClick={() => toggleListing(item.id, item.status)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(0,153,255,0.3)", borderRadius: "6px", fontSize: "10px", color: "#0099ff", cursor: "pointer" }}>
                    {item.status === "active" ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => deleteListing(item.id)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "6px", fontSize: "10px", color: "#ff6b6b", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MY ALERTS ── */}
        {activeTab === "My Alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
            ) : alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>No alerts yet</div>
                <a href="/alerts" style={{ color: "#0099ff", fontSize: "13px" }}>+ Create your first alert</a>
              </div>
            ) : alerts.map((alert, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{alert.card_name}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{alert.game} · alert when {alert.condition} <span style={{ color: "#0099ff" }}>${alert.target_price}</span></div>
                  {alert.email && <div style={{ fontSize: "10px", color: "#444460", marginTop: "2px" }}>📧 {alert.email}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: alert.status === "active" ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", color: alert.status === "active" ? "#00ff88" : "#8899bb", marginBottom: "6px", display: "inline-block" }}>
                    {alert.status === "active" ? "🟢 Active" : "⏸ Paused"}
                  </div>
                </div>
                <button onClick={() => deleteAlert(alert.id)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "6px", fontSize: "10px", color: "#ff6b6b", cursor: "pointer", flexShrink: 0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── MY DECKS ── */}
        {activeTab === "My Decks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
            ) : decks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎴</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>No decks saved</div>
                <a href="/deckbuilder" style={{ color: "#0099ff", fontSize: "13px" }}>+ Build your first deck</a>
              </div>
            ) : decks.map((deck, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "28px" }}>🎴</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{deck.name || "Unnamed Deck"}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{deck.game || "TCG"} · {new Date(deck.created_at).toLocaleDateString()}</div>
                </div>
                <a href="/deckbuilder" style={{ padding: "6px 12px", background: "transparent", border: "1px solid rgba(0,153,255,0.3)", borderRadius: "6px", fontSize: "11px", color: "#0099ff", textDecoration: "none" }}>
                  Edit →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── TOURNAMENTS ── */}
        {activeTab === "Tournaments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
            ) : tournaments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>No tournaments yet</div>
                <a href="/optcg" style={{ color: "#0099ff", fontSize: "13px" }}>+ Join a tournament</a>
              </div>
            ) : tournaments.map((t, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "28px" }}>🏆</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>{t.tournament_name || "Tournament"}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{t.game || "TCG"} · {new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "8px", background: "rgba(0,153,255,0.1)", color: "#0099ff", flexShrink: 0 }}>
                  {t.status || "Registered"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── WALLET ── */}
        {activeTab === "Wallet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "16px", padding: "20px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff", marginBottom: "16px" }}>Sui Wallet</div>
              <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>Address</div>
                <div style={{ fontSize: "12px", color: "#0099ff", fontFamily: "monospace", wordBreak: "break-all" }}>{walletAddress}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>Active Listings</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#0099ff" }}>{activeListings.length}</div>
                </div>
                <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "4px" }}>Price Alerts</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#00ffcc" }}>{activeAlerts.length}</div>
                </div>
              </div>
              <a href={`https://suiscan.xyz/mainnet/account/${walletAddress}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", padding: "10px", background: "rgba(0,153,255,0.1)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "8px", color: "#0099ff", fontSize: "12px", textDecoration: "none" }}>
                View on SuiScan ↗
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
