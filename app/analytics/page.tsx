"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Analytics() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalSales: 0,
    totalVolumeSui: 0,
    totalTraders: 0,
    totalAlerts: 0,
    totalMessages: 0,
    totalTournamentPlayers: 0,
  });
  const [topCards, setTopCards] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [
        listingsRes, salesRes, tradersRes,
        alertsRes, messagesRes, tournamentRes, topCardsRes
      ] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact" }),
        supabase.from("transactions").select("price_sui, card_name, created_at, buyer_address, seller_address").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("price_alerts").select("id", { count: "exact" }),
        supabase.from("messages").select("id", { count: "exact" }),
        supabase.from("tournament_registrations").select("id", { count: "exact" }),
        supabase.from("transactions").select("card_name").limit(100),
      ]);

      const sales = salesRes.data || [];
      const totalVolume = sales.reduce((sum, s) => sum + (Number(s.price_sui) || 0), 0);

      // Count card frequency
      const cardCount: Record<string, number> = {};
      (topCardsRes.data || []).forEach((t: any) => {
        if (t.card_name) cardCount[t.card_name] = (cardCount[t.card_name] || 0) + 1;
      });
      const topCardsList = Object.entries(cardCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalListings: listingsRes.count || 0,
        totalSales: sales.length,
        totalVolumeSui: totalVolume,
        totalTraders: tradersRes.count || 0,
        totalAlerts: alertsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalTournamentPlayers: tournamentRes.count || 0,
      });
      setTopCards(topCardsList);
      setRecentSales(sales.slice(0, 8));

      // Also fetch chain listings count
      const chainRes = await fetch("/api/listings");
      const chainJson = await chainRes.json();
      setStats(prev => ({ ...prev, totalListings: chainJson.listings?.length || prev.totalListings }));

    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const statCards = [
    { label: "On-Chain Listings", value: stats.totalListings, icon: "🃏", color: "#0099ff" },
    { label: "Total Sales", value: stats.totalSales, icon: "💰", color: "#00ff88" },
    { label: "Volume Traded", value: `${stats.totalVolumeSui.toFixed(1)} SUI`, icon: "📈", color: "#00d4ff" },
    { label: "Registered Traders", value: stats.totalTraders, icon: "👥", color: "#ffcc00" },
    { label: "Price Alerts", value: stats.totalAlerts, icon: "🔔", color: "#ff9955" },
    { label: "Messages Sent", value: stats.totalMessages, icon: "💬", color: "#0099ff" },
    { label: "Tournament Players", value: stats.totalTournamentPlayers, icon: "🏆", color: "#00ff88" },
    { label: "Platform Fee", value: "1%", icon: "⛓️", color: "#00d4ff" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000008", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 900, marginBottom: "6px" }}>📊 Analytics</h1>
        <p style={{ color: "#8899bb", fontSize: "14px", marginBottom: "32px" }}>WaveTCG platform metrics · Live data</p>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {statCards.map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: "#050515", border: `1px solid ${color}20`, borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color, fontFamily: "Cinzel, serif" }}>
                {loading ? "..." : value}
              </div>
              <div style={{ fontSize: "11px", color: "#8899bb", marginTop: "6px" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Top Cards */}
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "18px", marginBottom: "16px" }}>🔥 Most Traded Cards</h2>
            {loading ? (
              <div style={{ color: "#8899bb" }}>Loading...</div>
            ) : topCards.length === 0 ? (
              <div style={{ color: "#444460", textAlign: "center", padding: "20px" }}>No sales yet</div>
            ) : topCards.map((card, i) => (
              <div key={card.name} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < topCards.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,153,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#0099ff" }}>#{i+1}</div>
                <div style={{ flex: 1, fontSize: "13px", color: "#fff" }}>{card.name}</div>
                <div style={{ fontSize: "12px", color: "#00d4ff" }}>{card.count} sale{card.count > 1 ? "s" : ""}</div>
              </div>
            ))}
          </div>

          {/* Recent Sales */}
          <div style={{ background: "#050515", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "18px", marginBottom: "16px" }}>💸 Recent Sales</h2>
            {loading ? (
              <div style={{ color: "#8899bb" }}>Loading...</div>
            ) : recentSales.length === 0 ? (
              <div style={{ color: "#444460", textAlign: "center", padding: "20px" }}>No sales yet</div>
            ) : recentSales.map((sale, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < recentSales.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>{sale.card_name || "Card"}</div>
                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{new Date(sale.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#00d4ff" }}>{sale.price_sui} SUI</div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh button */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button onClick={fetchAll} style={{ background: "transparent", border: "1px solid rgba(0,153,255,0.3)", color: "#0099ff", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
