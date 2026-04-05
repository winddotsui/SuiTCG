"use client";
import { showSuccess, showError } from "../../../lib/toast";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "", twitter: "", discord: "", telegram: "", avatar_url: "", email: "" });

  const walletAddress = typeof window !== "undefined" ? localStorage.getItem("wavetcg_wallet_address") : null;
  const isOwner = walletAddress === address;

  useEffect(() => { if (address) fetchProfile(); }, [address]);

  async function fetchProfile() {
    setLoading(true);
    const { data: profileData } = await supabase.from("profiles").select("*").eq("wallet_address", address).single();
    const { data: listingsData } = await supabase.from("listings").select("*").eq("seller_address", address).eq("status", "active").order("created_at", { ascending: false });
    if (profileData) {
      setProfile(profileData);
      setForm({ username: profileData.username || "", bio: profileData.bio || "", twitter: profileData.twitter || "", discord: profileData.discord || "", telegram: profileData.telegram || "", avatar_url: profileData.avatar_url || "", email: profileData.email || "" });
    } else {
      setProfile({ wallet_address: address });
    }
    setListings(listingsData || []);
    setLoading(false);
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || "https://publisher.walrus-testnet.walrus.space"}/v1/blobs?epochs=5`, {
        method: "PUT", body: file, headers: { "Content-Type": file.type },
      });
      const data = await res.json();
      const blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;
      if (blobId) {
        const url = `${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space"}/v1/blobs/${blobId}`;
        setForm(prev => ({ ...prev, avatar_url: url }));
        await supabase.from("profiles").upsert({ wallet_address: address, avatar_url: url }, { onConflict: "wallet_address" });
        await fetchProfile();
      }
    } catch (e) { showError("Avatar upload failed"); console.error("Avatar upload failed:", e); }
    setUploading(false);
  }

  async function connectTwitter() { localStorage.setItem("wavetcg_wallet_address", address); window.location.href = "/api/auth/twitter"; }
  async function connectDiscord() { localStorage.setItem("wavetcg_wallet_address", address); window.location.href = "/api/auth/discord"; }
  async function connectLinkedIn() { localStorage.setItem("wavetcg_wallet_address", address); window.location.href = "/api/auth/linkedin"; }
  async function connectTelegram() {
    const username = window.prompt("Enter your Telegram username (without @):");
    if (username?.trim()) {
      const clean = username.trim().replace("@", "");
      await supabase.from("profiles").upsert({ wallet_address: address, telegram: clean }, { onConflict: "wallet_address" });
      await fetchProfile();
    }
  }

  async function saveProfile() {
    await supabase.from("profiles").upsert({
      wallet_address: address,
      username: form.username || null,
      bio: form.bio || null,
      email: form.email || null,
      twitter: form.twitter || null,
      discord: form.discord || null,
      telegram: form.telegram || null,
      avatar_url: form.avatar_url || null,
    }, { onConflict: "wallet_address" });
    setSaved(true);
    setEditing(false);
    fetchProfile();
    setTimeout(() => setSaved(false), 3000);
  }

  const shortAddress = (addr: string) => addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
  const displayName = profile?.username || shortAddress(address);
  const verifiedCount = [profile?.twitter, profile?.discord, profile?.telegram, profile?.linkedin].filter(Boolean).length;
  const isVerified = verifiedCount >= 2;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#0099ff", fontFamily: "Cinzel, serif", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <style>{`
        html, body { background: #000008; }
        .listing-card:hover { transform: translateY(-4px) !important; border-color: rgba(0,153,255,0.4) !important; }
        .social-pill:hover { opacity: 0.8; }
        .edit-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <div style={{ height: "0px", background: "linear-gradient(135deg, #000520 0%, #001040 40%, #000d30 70%, #000008 100%)", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(0,153,255,0.12)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(0,80,255,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(0,180,255,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,153,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 clamp(12px, 3vw, 24px)" }}>

        <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", marginTop: "24px", marginBottom: "28px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #0099ff)", border: "4px solid #000008", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "36px", color: "#fff", overflow: "hidden", cursor: isOwner ? "pointer" : "default", boxShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
              onClick={() => isOwner && document.getElementById("avatar-upload")?.click()}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : uploading ? "⏳" : displayName[0]?.toUpperCase() || "?"}
            </div>
            {isOwner && (
              <div style={{ position: "absolute", bottom: 2, right: 2, width: "28px", height: "28px", borderRadius: "50%", background: "#050515", border: "2px solid #0099ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", cursor: "pointer" }}
                onClick={() => document.getElementById("avatar-upload")?.click()}>📷</div>
            )}
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); }} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: "#ffffff", margin: 0 }}>{displayName}</h1>
              {isVerified && <span style={{ fontSize: "10px", background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "2px 10px", borderRadius: "20px", border: "1px solid rgba(0,255,136,0.25)", fontWeight: 600, flexShrink: 0 }}>✅ Verified</span>}
              {isOwner && <span style={{ fontSize: "10px", background: "rgba(0,153,255,0.1)", color: "#0099ff", padding: "2px 10px", borderRadius: "20px", border: "1px solid rgba(0,153,255,0.25)", fontWeight: 600, flexShrink: 0 }}>You</span>}
            </div>
            <div style={{ fontSize: "11px", color: "#444460", fontFamily: "monospace", marginBottom: "10px" }}>{shortAddress(address)}</div>
            {profile?.bio && <p style={{ fontSize: "13px", color: "#8899bb", lineHeight: 1.6, marginBottom: "10px", maxWidth: "500px" }}>{profile.bio}</p>}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {profile?.twitter && (
                <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="social-pill" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", fontSize: "11px", color: "#ffffff", textDecoration: "none" }}>
                  𝕏 @{profile.twitter}
                </a>
              )}
              {profile?.discord && (
                <div className="social-pill" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", background: "rgba(88,101,242,0.12)", border: "1px solid rgba(88,101,242,0.25)", borderRadius: "20px", fontSize: "11px", color: "#8b9cf4" }}>
                  💬 {profile.discord}
                </div>
              )}
              {profile?.telegram && (
                <a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noopener noreferrer" className="social-pill" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", background: "rgba(0,136,204,0.12)", border: "1px solid rgba(0,136,204,0.25)", borderRadius: "20px", fontSize: "11px", color: "#5bc8f5", textDecoration: "none" }}>
                  ✈️ @{profile.telegram}
                </a>
              )}
            </div>
          </div>

          {isOwner && (
            <button className="edit-btn" onClick={() => setEditing(!editing)} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#c8d8f0", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", flexShrink: 0, transition: "background 0.2s", alignSelf: "flex-end" }}>
              {editing ? "✕ Cancel" : "✏️ Edit Profile"}
            </button>
          )}
        </div>

        {saved && (
          <div style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: "#00ff88" }}>
            ✅ Profile saved successfully!
          </div>
        )}

        {editing && (
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "clamp(16px, 3vw, 24px)", marginBottom: "24px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff", marginBottom: "20px" }}>Edit Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8899bb", marginBottom: "6px" }}>Username</label>
                <input value={form.username} onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))} placeholder="e.g. TrainerRed"
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8899bb", marginBottom: "6px" }}>Bio</label>
                <input value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell buyers about yourself..."
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "Email (for notifications)", key: "email", placeholder: "your@email.com" },
                { label: "Twitter / X", key: "twitter", placeholder: "username (no @)" },
                { label: "Discord", key: "discord", placeholder: "username#1234" },
                { label: "Telegram", key: "telegram", placeholder: "username (no @)" },
              ].map(field => (
                <div key={field.key} style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "8px" }}>{field.label}</div>
                  <input value={(form as any)[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder}
                    style={{ width: "100%", background: "#000008", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "7px 10px", fontSize: "12px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
              <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "11px", color: "#8899bb", marginBottom: "2px" }}>OAuth</div>
                {[
                  { label: "Twitter", connected: profile?.twitter, fn: connectTwitter },
                  { label: "Discord", connected: profile?.discord, fn: connectDiscord },
                  { label: "LinkedIn", connected: profile?.linkedin, fn: connectLinkedIn },
                  { label: "Telegram", connected: profile?.telegram, fn: connectTelegram },
                ].map(s => (
                  <button key={s.label} onClick={s.fn} style={{ padding: "5px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: s.connected ? "#00ff88" : "#8899bb", fontSize: "10px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", textAlign: "left" }}>
                    {s.connected ? `✅ ${s.label}` : `→ ${s.label}`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={saveProfile} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Save Profile</button>
              <button onClick={() => setEditing(false)} style={{ background: "transparent", color: "#8899bb", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "32px" }}>
          {[
            { label: "Active Listings", val: listings.length, icon: "🃏", color: "#0099ff" },
            { label: "Total Sales", val: profile?.total_sales || 0, icon: "💰", color: "#00d4ff" },
            { label: "Reputation", val: profile?.reputation || 0, icon: "⭐", color: "#00ffcc" },
            { label: "Member Since", val: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "New", icon: "📅", color: "#0099ff" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.1)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 600, color: stat.color, marginBottom: "4px" }}>{stat.val}</div>
              <div style={{ fontSize: "10px", color: "#444460", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(16px, 3vw, 20px)", color: "#ffffff", margin: 0 }}>
              Active Listings <span style={{ fontSize: "14px", color: "#0099ff", fontFamily: "DM Sans, sans-serif" }}>({listings.length})</span>
            </h2>
            {isOwner && <a href="/sell" style={{ fontSize: "12px", color: "#0099ff", textDecoration: "none", border: "1px solid rgba(0,153,255,0.25)", padding: "6px 14px", borderRadius: "6px" }}>+ List a Card</a>}
          </div>
          {listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#050515", borderRadius: "14px", border: "1px solid rgba(0,153,255,0.1)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🃏</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>No active listings yet</div>
              <p style={{ fontSize: "13px", color: "#8899bb", marginBottom: "20px" }}>{isOwner ? "Start selling your cards on WaveTCG" : "This collector hasn't listed any cards yet"}</p>
              {isOwner && <a href="/sell" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>List a Card</a>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {listings.map(card => (
                <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration: "none" }}>
                  <div className="listing-card" style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: "100%", aspectRatio: "3/4", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", overflow: "hidden" }}>
                      {card.image_url ? <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🃏"}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", fontWeight: 600, color: "#ffffff", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: "10px", color: "#444460", marginBottom: "6px" }}>{card.game} · {card.condition}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0099ff" }}>${card.price_usd?.toLocaleString()}</span>
                        <span style={{ fontSize: "9px", color: "#0099ff", padding: "2px 6px", background: "rgba(0,153,255,0.1)", borderRadius: "4px", border: "1px solid rgba(0,153,255,0.2)" }}>Buy</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
