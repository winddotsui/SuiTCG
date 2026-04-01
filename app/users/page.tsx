"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const [showDropdown, setShowDropdown] = useState(false);
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
      if (data) {
        console.log("Loaded users:", data.length, data.map((u:any) => u.username));
        setAllUsers(data);
        setUsers(data);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setLoading(false);
  }

  function shortAddress(addr: string) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  const verifiedCount = (u: any) => [u.twitter, u.discord, u.telegram, u.linkedin].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000d20 50%, #000008 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(0,153,255,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>◈ WaveTCG · Community</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Find Traders</h1>
        <p style={{ fontSize: "14px", color: "#c8d8f0", maxWidth: "500px", margin: "0 auto" }}>Search traders, check their cards, tournament stats and more</p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => search.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="🔍 Search by username, wallet address, Twitter, Discord..."
            style={{ width: "100%", background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", padding: "16px 20px", fontSize: "15px", color: "#ffffff", fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box" as const }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setShowDropdown(false); }} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#c8d8f0", cursor: "pointer", fontSize: "18px" }}>×</button>
          )}
          {showDropdown && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#050515", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "12px", zIndex: 100, marginTop: "4px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", overflow: "hidden" }}>
              {suggestions.map((user, i) => {
                const displayName = user.username || shortAddress(user.wallet_address);
                return (
                  <a key={i} href={`/profile/${user.wallet_address}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #0099ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#fff", fontWeight: 700 }}>{displayName[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{displayName}</div>
                        <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{shortAddress(user.wallet_address)}</div>
                      </div>
                      {verifiedCount(user) >= 2 && <span style={{ fontSize: "10px", color: "#00ff88" }}>✅ Verified</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px 20px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#0099ff" }}>{allUsers.length}</div>
            <div style={{ fontSize: "11px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Traders</div>
          </div>
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px 20px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#00d4ff" }}>{allUsers.filter(u => u.twitter || u.discord).length}</div>
            <div style={{ fontSize: "11px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Verified</div>
          </div>
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px 20px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#00ffcc" }}>{users.length}</div>
            <div style={{ fontSize: "11px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Results</div>
          </div>
        </div>

        {/* Users list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#0099ff" }}>Loading traders...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#050515", borderRadius: "16px", border: "1px solid rgba(0,153,255,0.15)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#ffffff", marginBottom: "8px" }}>No traders found</div>
            <p style={{ fontSize: "13px", color: "#c8d8f0" }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {users.map((user, i) => {
              const vc = verifiedCount(user);
              const displayName = user.username || shortAddress(user.wallet_address);
              return (
                <a key={i} href={`/profile/${user.wallet_address}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.4)"; (e.currentTarget as HTMLDivElement).style.background = "#0a1628"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,153,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "#050515"; }}>

                    {/* Avatar */}
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #0055ff, #0099ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#fff", fontWeight: 700 }}>{displayName[0]?.toUpperCase()}</span>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", fontWeight: 700 }}>{displayName}</span>
                        {vc >= 2 && <span style={{ fontSize: "10px", background: "rgba(0,255,100,0.1)", color: "#00ff88", padding: "2px 8px", borderRadius: "8px", border: "1px solid rgba(0,255,100,0.2)", fontWeight: 600 }}>✅ Verified</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "#c8d8f0", marginBottom: "6px" }}>{shortAddress(user.wallet_address)}</div>
                      {user.bio && <div style={{ fontSize: "12px", color: "#8899bb", marginBottom: "6px" }}>{user.bio.slice(0, 80)}{user.bio.length > 80 ? "..." : ""}</div>}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {user.twitter && <span style={{ fontSize: "11px", color: "#1da1f2" }}>𝕏 @{user.twitter}</span>}
                        {user.discord && <span style={{ fontSize: "11px", color: "#5865f2" }}>💬 {user.discord}</span>}
                        {user.telegram && <span style={{ fontSize: "11px", color: "#0088cc" }}>✈️ {user.telegram}</span>}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "4px" }}>
                        🃏 <span style={{ color: "#0099ff", fontWeight: 600 }}>{user.listings?.[0]?.count || 0}</span> listings
                      </div>
                      <div style={{ fontSize: "11px", color: "#c8d8f0", marginBottom: "8px" }}>
                        🏆 <span style={{ color: "#00d4ff", fontWeight: 600 }}>{user.tournament_registrations?.[0]?.count || 0}</span> tournaments
                      </div>
                      <div style={{ fontSize: "11px", color: "#0099ff" }}>View Profile →</div>
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
