"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => { fetchAllUsers(); }, []);

  const suggestions = search.length > 0 ? allUsers.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.wallet_address?.toLowerCase().includes(search.toLowerCase()) ||
    u.twitter?.toLowerCase().includes(search.toLowerCase()) ||
    u.discord?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6) : [];

  useEffect(() => {
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      setUsers(allUsers.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.wallet_address?.toLowerCase().includes(q) ||
        u.twitter?.toLowerCase().includes(q) ||
        u.discord?.toLowerCase().includes(q)
      ));
      setShowDropdown(true);
    } else {
      setUsers(allUsers);
      setShowDropdown(false);
    }
  }, [search, allUsers]);

  async function fetchAllUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) console.error("Supabase error:", error);
      if (data) { setAllUsers(data); setUsers(data); }
    } catch (e) { console.error("Fetch error:", e); }
    setLoading(false);
  }

  function shortAddress(addr: string) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  const verifiedCount = (u: any) => [u.twitter, u.discord, u.telegram, u.linkedin].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100dvh", background: "#000008", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "clamp(20px, 4vw, 60px) clamp(16px, 4vw, 48px) clamp(14px, 3vw, 40px)", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "6px" }}>◈ WaveTCG · Collectors</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 5vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "6px" }}>Find Collectors</h1>
        <p style={{ fontSize: "clamp(12px, 2vw, 14px)", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Search collectors, check their cards, tournament stats and more</p>
      </div>

      <div style={{ maxWidth: "900px", width: "100%", margin: "0 auto", padding: "clamp(10px, 3vw, 20px) clamp(10px, 3vw, 12px)", flex: 1, display: "flex", flexDirection: "column" }}>

        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => search.length > 0 && setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} placeholder="🔍 Search by username, wallet, Twitter, Discord..." style={{ width: "100%", background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }} />
          {search && <button onClick={() => { setSearch(""); setShowDropdown(false); }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#c8d8f0", cursor: "pointer", fontSize: "18px" }}>×</button>}
          {showDropdown && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "10px", zIndex: 100, marginTop: "4px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", overflow: "hidden" }}>
              {suggestions.map((user, i) => {
                const displayName = user.username || shortAddress(user.wallet_address);
                return (
                  <a key={i} href={`/profile/${user.wallet_address}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #0099ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {user.avatar_url ? <img src={user.avatar_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "Cinzel, serif", fontSize: "12px", color: "#fff", fontWeight: 700 }}>{displayName[0]?.toUpperCase()}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{displayName}</div>
                        <div style={{ fontSize: "10px", color: "#c8d8f0" }}>{shortAddress(user.wallet_address)}</div>
                      </div>
                      {verifiedCount(user) >= 2 && <span style={{ fontSize: "10px", color: "#00ff88" }}>✅</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {[{ label: "Collectors", value: allUsers.length, color: "#0099ff" }, { label: "Verified", value: allUsers.filter(u => u.twitter || u.discord).length, color: "#00d4ff" }, { label: "Results", value: users.length, color: "#00ffcc" }].map(stat => (
            <div key={stat.label} style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "10px", padding: "10px 8px", flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading collectors...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#050515", borderRadius: "14px", border: "1px solid rgba(0,153,255,0.15)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "6px" }}>No collectors found</div>
            <p style={{ fontSize: "12px", color: "#c8d8f0" }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
            {users.map((user, i) => {
              const vc = verifiedCount(user);
              const displayName = user.username || shortAddress(user.wallet_address);
              return (
                <a key={i} href={`/profile/${user.wallet_address}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.4)"; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #0099ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {user.avatar_url ? <img src={user.avatar_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#fff", fontWeight: 700 }}>{displayName[0]?.toUpperCase()}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ffffff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span>
                        {vc >= 2 && <span style={{ fontSize: "9px", background: "rgba(0,255,100,0.1)", color: "#00ff88", padding: "1px 6px", borderRadius: "6px", border: "1px solid rgba(0,255,100,0.2)", fontWeight: 600, flexShrink: 0 }}>✅ Verified</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "3px" }}>{shortAddress(user.wallet_address)}</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {user.twitter && <span style={{ fontSize: "10px", color: "#1da1f2" }}>𝕏 @{user.twitter}</span>}
                        {user.discord && <span style={{ fontSize: "10px", color: "#5865f2" }}>💬 {user.discord}</span>}
                        {user.telegram && <span style={{ fontSize: "10px", color: "#0088cc" }}>✈️ {user.telegram}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "10px", color: "#c8d8f0", marginBottom: "2px" }}>🃏 <span style={{ color: "#0099ff", fontWeight: 600 }}>{user.listings?.[0]?.count || 0}</span> listings</div>
                      <div style={{ fontSize: "10px", color: "#c8d8f0", marginBottom: "6px" }}>🏆 <span style={{ color: "#00d4ff", fontWeight: 600 }}>{user.tournament_registrations?.[0]?.count || 0}</span> tournaments</div>
                      <div style={{ fontSize: "10px", color: "#0099ff", whiteSpace: "nowrap" }}>View Profile →</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
