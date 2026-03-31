"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "", twitter: "", discord: "", telegram: "", avatar_url: "" });

  useEffect(() => {
    if (address) fetchProfile();
  }, [address]);

  async function fetchProfile() {
    setLoading(true);
    const { data: profileData } = await supabase.from("profiles").select("*").eq("wallet_address", address).single();
    const { data: listingsData } = await supabase.from("listings").select("*").eq("seller_address", address).eq("status", "active").order("created_at", { ascending: false });
    if (profileData) {
      setProfile(profileData);
      setForm({ username: profileData.username || "", bio: profileData.bio || "", twitter: profileData.twitter || "", discord: profileData.discord || "", telegram: profileData.telegram || "", avatar_url: profileData.avatar_url || "" });
    } else {
      setProfile({ wallet_address: address });
    }
    setListings(listingsData || []);
    setLoading(false);
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const res = await fetch("https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5", {
        method: "PUT", body: file, headers: { "Content-Type": file.type },
      });
      const data = await res.json();
      const blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;
      if (blobId) {
        const url = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
        setForm(prev => ({ ...prev, avatar_url: url }));
        await supabase.from("profiles").upsert({ wallet_address: address, avatar_url: url }, { onConflict: "wallet_address" });
        await fetchProfile();
      }
    } catch (e) { console.error("Avatar upload failed:", e); }
    setUploading(false);
  }

  async function connectTwitter() {
    localStorage.setItem("wavetcg_wallet_address", address);
    window.location.href = "/api/auth/twitter";
  }

  async function connectDiscord() {
    localStorage.setItem("wavetcg_wallet_address", address);
    window.location.href = "/api/auth/discord";
  }

  async function connectTelegram() {
    alert("Enter your Telegram username manually in the Edit Profile form below!");
  }

  async function saveProfile() {
    const { error } = await supabase.from("profiles").upsert({
      wallet_address: address,
      username: form.username || null,
      bio: form.bio || null,
      twitter: form.twitter || null,
      discord: form.discord || null,
      telegram: form.telegram || null,
      avatar_url: form.avatar_url || null,
    }, { onConflict: "wallet_address" });
    if (!error) { setEditing(false); fetchProfile(); }
  }

  const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "";
  const displayName = profile?.username || shortAddress;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#4da2ff", fontFamily: "Cinzel, serif", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ height: "80px", background: "linear-gradient(135deg, #0a0a0f 0%, #111a2e 50%, #0a0a0f 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(77,162,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", marginTop: "16px", marginBottom: "32px", flexWrap: "wrap" }}>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, #1a8fe3, #4da2ff)", border: "4px solid #0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "36px", color: "#fff", overflow: "hidden", cursor: "pointer" }}
              onClick={() => document.getElementById("avatar-upload")?.click()}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (uploading ? "⏳" : displayName[0]?.toUpperCase() || "?")}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "26px", height: "26px", borderRadius: "50%", background: "#111118", border: "2px solid #4da2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", cursor: "pointer" }}
              onClick={() => document.getElementById("avatar-upload")?.click()}>📷</div>
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); }} />
          </div>

          <div style={{ flex: 1, paddingBottom: "8px" }}>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 700, color: "#e6e4f0", marginBottom: "4px" }}>{displayName}</h1>
            <div style={{ fontSize: "13px", color: "#555562", fontFamily: "monospace", marginBottom: "8px" }}>{address}</div>
            {profile?.bio && <p style={{ fontSize: "14px", color: "#888898", lineHeight: 1.6, marginBottom: "10px" }}>{profile.bio}</p>}

            {/* Social links display */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {profile?.twitter && (
                <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", fontSize: "12px", color: "#e6e4f0", textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  @{profile.twitter}
                </a>
              )}
              {profile?.discord && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.3)", borderRadius: "20px", fontSize: "12px", color: "#8b9cf4" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055A19.9 19.9 0 0 0 6.063 21.6a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  {profile.discord}
                </div>
              )}
              {profile?.telegram && (
                <a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(0,136,204,0.15)", border: "1px solid rgba(0,136,204,0.3)", borderRadius: "20px", fontSize: "12px", color: "#5bc8f5", textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  @{profile.telegram}
                </a>
              )}
              {!profile?.twitter && !profile?.discord && !profile?.telegram && (
                <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "20px", fontSize: "12px", color: "#555562", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                  + Connect Socials
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setEditing(!editing)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#888898", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Edit Profile</button>
        </div>

        {editing && (
          <div style={{ background: "#111118", border: "1px solid rgba(77,162,255,0.2)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "20px" }}>Edit Profile</h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888898", marginBottom: "8px" }}>Username</label>
              <input value={form.username} onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))} placeholder="e.g. TrainerRed"
                style={{ width: "100%", background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888898", marginBottom: "8px" }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell buyers about yourself..." rows={3}
                style={{ width: "100%", background: "#18181f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#e6e4f0", marginBottom: "16px" }}>Connect Socials</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {/* Twitter */}
              <div style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#e6e4f0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span style={{ fontSize: "13px", color: "#e6e4f0", fontWeight: 500 }}>Twitter / X</span>
                </div>
                <input value={form.twitter} onChange={e => setForm(prev => ({ ...prev, twitter: e.target.value }))} placeholder="username (no @)"
                  style={{ width: "100%", background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
                {form.twitter && <div style={{ fontSize: "11px", color: "#4caf7d", marginTop: "6px" }}>twitter.com/{form.twitter}</div>}
              </div>

              {/* Discord */}
              <div style={{ background: "#18181f", border: "1px solid rgba(88,101,242,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#8b9cf4"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055A19.9 19.9 0 0 0 6.063 21.6a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  <span style={{ fontSize: "13px", color: "#8b9cf4", fontWeight: 500 }}>Discord</span>
                </div>
                <input value={form.discord} onChange={e => setForm(prev => ({ ...prev, discord: e.target.value }))} placeholder="username#1234"
                  style={{ width: "100%", background: "#0a0a0f", border: "1px solid rgba(88,101,242,0.2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
                {form.discord && <div style={{ fontSize: "11px", color: "#4caf7d", marginTop: "6px" }}>Connected!</div>}
              </div>

              {/* Telegram */}
              <div style={{ background: "#18181f", border: "1px solid rgba(0,136,204,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#5bc8f5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  <span style={{ fontSize: "13px", color: "#5bc8f5", fontWeight: 500 }}>Telegram</span>
                </div>
                <input value={form.telegram} onChange={e => setForm(prev => ({ ...prev, telegram: e.target.value }))} placeholder="username (no @)"
                  style={{ width: "100%", background: "#0a0a0f", border: "1px solid rgba(0,136,204,0.2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", color: "#e6e4f0", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" }} />
                {form.telegram && <div style={{ fontSize: "11px", color: "#4caf7d", marginTop: "6px" }}>t.me/{form.telegram}</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
              <button onClick={connectTwitter} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: profile?.twitter ? "rgba(76,175,61,0.1)" : "#000", border: profile?.twitter ? "1px solid rgba(76,175,61,0.3)" : "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", cursor: "pointer", color: profile?.twitter ? "#4caf7d" : "#e6e4f0", fontSize: "13px", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                {profile?.twitter ? "✅ @" + profile.twitter : "Connect Twitter"}
              </button>
              <button onClick={connectDiscord} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: profile?.discord ? "rgba(76,175,61,0.1)" : "rgba(88,101,242,0.15)", border: profile?.discord ? "1px solid rgba(76,175,61,0.3)" : "1px solid rgba(88,101,242,0.3)", borderRadius: "10px", cursor: "pointer", color: profile?.discord ? "#4caf7d" : "#8b9cf4", fontSize: "13px", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055A19.9 19.9 0 0 0 6.063 21.6a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                {profile?.discord ? "✅ " + profile.discord : "Connect Discord"}
              </button>
              <button onClick={connectTelegram} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: profile?.telegram ? "rgba(76,175,61,0.1)" : "rgba(0,136,204,0.15)", border: profile?.telegram ? "1px solid rgba(76,175,61,0.3)" : "1px solid rgba(0,136,204,0.3)", borderRadius: "10px", cursor: "pointer", color: profile?.telegram ? "#4caf7d" : "#5bc8f5", fontSize: "13px", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                {profile?.telegram ? "✅ @" + profile.telegram : "Connect Telegram"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={saveProfile} style={{ background: "linear-gradient(135deg, #1a8fe3, #4da2ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Save Profile</button>
              <button onClick={() => setEditing(false)} style={{ background: "transparent", color: "#888898", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "40px" }}>
          {[
            { label: "Active Listings", val: listings.length, icon: "🃏" },
            { label: "Total Sales", val: profile?.total_sales || 0, icon: "💰" },
            { label: "Reputation", val: profile?.reputation || 0, icon: "⭐" },
            { label: "Member Since", val: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "New", icon: "📅" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", fontWeight: 600, color: "#4da2ff", marginBottom: "4px" }}>{stat.val}</div>
              <div style={{ fontSize: "11px", color: "#888898", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#e6e4f0", marginBottom: "20px" }}>Active Listings ({listings.length})</h2>
          {listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#111118", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🃏</div>
              <p style={{ fontSize: "14px", color: "#888898", marginBottom: "20px" }}>No active listings yet</p>
              <a href="/sell" style={{ display: "inline-block", background: "linear-gradient(135deg, #1a8fe3, #4da2ff)", color: "#fff", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", textDecoration: "none" }}>List a Card</a>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
              {listings.map(card => (
                <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
                  >
                    <div style={{ width: "100%", aspectRatio: "3/2", background: "#18181f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", overflow: "hidden" }}>
                      {card.image_url ? <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🃏"}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: "12px", fontWeight: 600, color: "#e6e4f0", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: "10px", color: "#555562", marginBottom: "6px" }}>{card.game} · {card.condition}</div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#78bfff" }}>${card.price_usd?.toLocaleString()}</div>
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
