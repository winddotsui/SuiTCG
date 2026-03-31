"use client";
import { useState } from "react";

const RANKINGS = [
  { rank: 1, player: "LuffyKing_PH", wins: 47, losses: 8, points: 2350, deck: "OP01 - Luffy Red", badge: "👑", change: "+2" },
  { rank: 2, player: "ZoroSlash", wins: 42, losses: 11, points: 2180, deck: "OP02 - Zoro Green", badge: "🥈", change: "+1" },
  { rank: 3, player: "NamiNavigator", wins: 39, losses: 14, points: 2050, deck: "OP03 - Nami Blue", badge: "🥉", change: "-1" },
  { rank: 4, player: "ShanksLegend", wins: 36, losses: 15, points: 1920, deck: "OP01 - Shanks Red", badge: "⭐", change: "+3" },
  { rank: 5, player: "AceFire_PH", wins: 34, losses: 17, points: 1850, deck: "OP02 - Ace Purple", badge: "⭐", change: "0" },
  { rank: 6, player: "RobinFlower", wins: 31, losses: 19, points: 1720, deck: "OP04 - Robin Black", badge: "⭐", change: "-2" },
  { rank: 7, player: "ChopperDoc", wins: 28, losses: 22, points: 1580, deck: "OP01 - Chopper Green", badge: "⭐", change: "+1" },
  { rank: 8, player: "FrankyShip", wins: 26, losses: 24, points: 1450, deck: "OP03 - Franky Blue", badge: "⭐", change: "+4" },
];

const ENTRY_FEE = 10;

function TreasureChest({ pot, players, maxPlayers }: { pot: number; players: number; maxPlayers: number }) {
  const progress = (players / maxPlayers) * 100;
  return (
    <div style={{ background: "linear-gradient(135deg, #1a0e00, #2a1800)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: "20px", padding: "32px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(255,180,0,0.08)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top, rgba(255,180,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: "80px", marginBottom: "8px", filter: "drop-shadow(0 0 20px rgba(255,180,0,0.5))" }}>💰</div>
      <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "8px" }}>Tournament Prize Pool</div>
      <div style={{ fontFamily: "Cinzel, serif", fontSize: "56px", fontWeight: 900, color: "#e8c97a", textShadow: "0 0 30px rgba(255,180,0,0.4)", lineHeight: 1, marginBottom: "4px" }}>{pot} SUI</div>
      <div style={{ fontSize: "13px", color: "#888898", marginBottom: "24px" }}>≈ ${(pot * 7.28).toFixed(0)} USD</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
        {[
          { place: "🥇 1st", pct: 40, sui: Math.floor(pot * 0.4) },
          { place: "🥈 2nd", pct: 25, sui: Math.floor(pot * 0.25) },
          { place: "🥉 3rd", pct: 20, sui: Math.floor(pot * 0.2) },
        ].map((prize, i) => (
          <div key={i} style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: "10px", padding: "12px 8px" }}>
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{prize.place.split(" ")[0]}</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", color: "#c9a84c", marginBottom: "6px" }}>{prize.place.split(" ")[1]}</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#e8c97a" }}>{prize.sui} SUI</div>
            <div style={{ fontSize: "10px", color: "#888898" }}>{prize.pct}% of pot</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888898" }}>
        <span>👥 {players}/{maxPlayers} players</span>
        <span style={{ color: "#e8c97a" }}>{maxPlayers - players} spots left</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: "3px", width: `${progress}%`, background: "linear-gradient(90deg, #c9a84c, #e8c97a)", boxShadow: "0 0 10px rgba(255,180,0,0.4)" }} />
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoin, pot }: { onClose: () => void; onJoin: () => void; pot: number }) {
  const [step, setStep] = useState<"confirm" | "paying" | "success">("confirm");
  const [walletConnected, setWalletConnected] = useState(false);

  async function handleJoin() {
    if (!walletConnected) { alert("Please connect your Sui wallet first!"); return; }
    setStep("paying");
    await new Promise(r => setTimeout(r, 2000));
    setStep("success");
    setTimeout(() => { onJoin(); onClose(); }, 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#111118", border: "1px solid rgba(255,180,0,0.3)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "420px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#888898", fontSize: "18px", cursor: "pointer" }}>✕</button>
        {step === "confirm" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💰</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#e6e4f0", marginBottom: "8px" }}>Join Tournament</h2>
              <p style={{ fontSize: "13px", color: "#888898" }}>WaveTCG Weekly OPTCG Tournament</p>
            </div>
            <div style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "Entry Fee", val: "10 SUI", color: "#e8c97a" },
                { label: "Current Pot", val: `${pot} SUI`, color: "#4da2ff" },
                { label: "1st Prize", val: `${Math.floor((pot + 10) * 0.5)} SUI`, color: "#4caf7d" },
                { label: "2nd Prize", val: `${Math.floor((pot + 10) * 0.3)} SUI`, color: "#78bfff" },
                { label: "3rd Prize", val: `${Math.floor((pot + 10) * 0.2)} SUI`, color: "#c9a84c" },
                { label: "Payment", val: "On-chain via Sui", color: "#888898" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize: "13px", color: "#888898" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
            {!walletConnected ? (
              <button onClick={() => setWalletConnected(true)} style={{ width: "100%", background: "rgba(77,162,255,0.1)", border: "1px solid rgba(77,162,255,0.3)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#78bfff", cursor: "pointer", fontFamily: "DM Sans, sans-serif", marginBottom: "10px" }}>◈ Connect Sui Wallet</button>
            ) : (
              <div style={{ background: "rgba(76,175,61,0.1)", border: "1px solid rgba(76,175,61,0.2)", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#4caf7d", textAlign: "center", marginBottom: "10px" }}>✅ Wallet connected</div>
            )}
            <button onClick={handleJoin} style={{ width: "100%", background: walletConnected ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "rgba(255,255,255,0.05)", color: walletConnected ? "#0a0a0f" : "#555562", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: walletConnected ? "pointer" : "not-allowed", fontFamily: "DM Sans, sans-serif" }}>
              💰 Pay 10 SUI & Join Tournament
            </button>
            <p style={{ fontSize: "11px", color: "#555562", textAlign: "center", marginTop: "12px" }}>Payment held on-chain · Auto-distributed to winners</p>
          </>
        )}
        {step === "paying" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#e6e4f0", marginBottom: "8px" }}>Processing Payment</h2>
            <p style={{ fontSize: "13px", color: "#888898" }}>Sending 10 SUI to tournament escrow...</p>
          </div>
        )}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏴‍☠️</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#e6e4f0", marginBottom: "8px" }}>You're In!</h2>
            <p style={{ fontSize: "13px", color: "#4caf7d", marginBottom: "8px" }}>✅ 10 SUI paid successfully</p>
            <p style={{ fontSize: "13px", color: "#888898" }}>Good luck, Pirate! 🏆</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OPTCGHub() {
  const [activeTab, setActiveTab] = useState("tournament");
  const [showSimulator, setShowSimulator] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [players, setPlayers] = useState(14);
  const maxPlayers = 64;
  const pot = players * ENTRY_FEE;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #1a0505 50%, #0a0a0f 100%)", padding: "60px 48px 40px", borderBottom: "1px solid rgba(255,255,255,0.07)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,50,50,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ff6b6b", marginBottom: "12px" }}>🏴‍☠️ WaveTCG · One Piece TCG Hub</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: "#e6e4f0", marginBottom: "16px" }}>One Piece TCG Hub</h1>
        <p style={{ fontSize: "16px", color: "#888898", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.75 }}>Play online, compete for real SUI prizes, climb the rankings.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowSimulator(true)} style={{ background: "linear-gradient(135deg, #cc0000, #ff3333)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 24px rgba(255,50,50,0.3)" }}>⚔️ Play OPTCGSim</button>
          <button onClick={() => setShowJoin(true)} style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#0a0a0f", border: "none", borderRadius: "8px", padding: "14px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 24px rgba(201,168,76,0.3)" }}>💰 Join Weekly Tournament</button>
        </div>
      </div>

      {showSimulator && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#111118", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "16px", width: "100%", maxWidth: "500px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#18181f" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#e6e4f0" }}>🏴‍☠️ OPTCGSim</div>
              <button onClick={() => setShowSimulator(false)} style={{ background: "transparent", border: "none", color: "#888898", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏴‍☠️</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#e6e4f0", marginBottom: "12px" }}>OPTCGSim</h2>
              <p style={{ fontSize: "14px", color: "#888898", lineHeight: 1.75, marginBottom: "32px" }}>Free fan-made One Piece TCG simulator. Practice your decks and compete worldwide.</p>
              <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #cc0000, #ff3333)", color: "#fff", padding: "14px 40px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,50,50,0.3)" }}>🏴‍☠️ Launch OPTCGSim →</a>
            </div>
          </div>
        </div>
      )}

      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoin={() => setPlayers(p => p + 1)} pot={pot} />}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "32px" }}>
          {[
            { id: "tournament", label: "💰 Weekly Tournament" },
            { id: "rankings", label: "🏆 Rankings" },
            { id: "howtoplay", label: "📖 How to Play" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 24px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? "2px solid #ff3333" : "2px solid transparent", color: activeTab === tab.id ? "#ff6b6b" : "#888898", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", marginBottom: "-1px" }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "tournament" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>
            <div>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#e6e4f0" }}>WaveTCG Weekly #17</h2>
                  <span style={{ padding: "4px 12px", background: "rgba(76,175,61,0.1)", border: "1px solid rgba(76,175,61,0.2)", borderRadius: "20px", fontSize: "11px", color: "#4caf7d" }}>🟢 Open</span>
                </div>
                <p style={{ fontSize: "14px", color: "#888898", lineHeight: 1.75 }}>Weekly One Piece TCG tournament. Pay 10 SUI to enter. Winners automatically receive SUI prizes on-chain.</p>
              </div>

              <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "16px" }}>📋 Tournament Rules</div>
                {[
                  { icon: "💰", rule: "Entry fee: 10 SUI per player (paid on-chain)" },
                  { icon: "🏆", rule: "Format: Swiss rounds + Top 8 single elimination" },
                  { icon: "🥇", rule: "1st place receives 50% of the total prize pool" },
                  { icon: "🥈", rule: "2nd place receives 30% of the total prize pool" },
                  { icon: "🥉", rule: "3rd place receives 20% of the total prize pool" },
                  { icon: "⛓️", rule: "Prizes distributed automatically via Sui smart contract" },
                  { icon: "🃏", rule: "All legal One Piece TCG sets allowed (OP01–OP14)" },
                  { icon: "⚔️", rule: "Matches played on OPTCGSim — share room code with opponent" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ fontSize: "13px", color: "#888898", lineHeight: 1.6 }}>{r.rule}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#e6e4f0", marginBottom: "16px" }}>📅 Schedule</div>
                {[
                  { time: "Now — Apr 5", event: "Registration Open", status: "active" },
                  { time: "Apr 5, 6PM PHT", event: "Registration Closes", status: "upcoming" },
                  { time: "Apr 5, 7PM PHT", event: "Round 1 Begins", status: "upcoming" },
                  { time: "Apr 5, 10PM PHT", event: "Top 8 Announced", status: "upcoming" },
                  { time: "Apr 6, 7PM PHT", event: "Top 8 Matches", status: "upcoming" },
                  { time: "Apr 6, 11PM PHT", event: "Winners & Prize Distribution", status: "upcoming" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.status === "active" ? "#4caf7d" : "#333", flexShrink: 0, boxShadow: s.status === "active" ? "0 0 8px #4caf7d" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: s.status === "active" ? "#e6e4f0" : "#888898" }}>{s.event}</div>
                      <div style={{ fontSize: "11px", color: "#555562" }}>{s.time}</div>
                    </div>
                    {s.status === "active" && <span style={{ fontSize: "10px", color: "#4caf7d", padding: "2px 8px", background: "rgba(76,175,61,0.1)", borderRadius: "10px" }}>Now</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "sticky", top: "80px" }}>
              <TreasureChest pot={pot} players={players} maxPlayers={maxPlayers} />
              <button onClick={() => setShowJoin(true)} style={{ width: "100%", marginTop: "16px", background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#0a0a0f", border: "none", borderRadius: "12px", padding: "18px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}>
                💰 Join for 10 SUI
              </button>
              <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "#555562" }}>⛓️ Payment secured by Sui blockchain · Auto-distributed to winners</div>

              <div style={{ marginTop: "20px", background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "12px", color: "#888898", marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Registrations</div>
                {["LuffyKing_PH", "ZoroSlash", "NamiNavigator", "ShanksLegend", "AceFire_PH"].map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#ff6b6b", fontFamily: "Cinzel, serif" }}>{p[0]}</div>
                    <span style={{ fontSize: "13px", color: "#888898" }}>{p}</span>
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#4caf7d" }}>✓ Paid</span>
                  </div>
                ))}
                <div style={{ textAlign: "center", marginTop: "8px", fontSize: "12px", color: "#555562" }}>+{players - 5} more registered</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rankings" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#e6e4f0", marginBottom: "4px" }}>Global Rankings</h2>
                <p style={{ fontSize: "13px", color: "#888898" }}>Updated after every tournament · Season 1</p>
              </div>
              <div style={{ padding: "6px 14px", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "20px", fontSize: "12px", color: "#ff6b6b" }}>🔴 Live</div>
            </div>
            <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#555562" }}>
                <div>Rank</div><div>Player</div><div>Deck</div><div style={{ textAlign: "center" }}>Record</div><div style={{ textAlign: "right" }}>Points</div><div style={{ textAlign: "right" }}>Change</div>
              </div>
              {RANKINGS.map((player, i) => (
                <div key={player.rank} style={{ display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 80px", padding: "14px 20px", alignItems: "center", borderBottom: i < RANKINGS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#18181f"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px" }}>{player.badge}</span>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#888898" }}>#{player.rank}</span>
                  </div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#e6e4f0" }}>{player.player}</div>
                  <div style={{ fontSize: "11px", color: "#888898" }}>{player.deck}</div>
                  <div style={{ textAlign: "center", fontSize: "12px" }}>
                    <span style={{ color: "#4caf7d" }}>{player.wins}W</span><span style={{ color: "#555562" }}> · </span><span style={{ color: "#e05555" }}>{player.losses}L</span>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#4da2ff" }}>{player.points.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontSize: "12px", color: player.change.startsWith("+") ? "#4caf7d" : player.change === "0" ? "#888898" : "#e05555" }}>{player.change === "0" ? "—" : player.change}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "howtoplay" && (
          <div style={{ maxWidth: "700px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#e6e4f0", marginBottom: "32px" }}>How to Join & Play</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { step: "1", title: "Connect Your Sui Wallet", desc: "Click Connect in the navbar. You need a Sui wallet with at least 10 SUI to enter.", icon: "◈" },
                { step: "2", title: "Pay 10 SUI Entry Fee", desc: "Click Join for 10 SUI. Payment is held in smart contract escrow — 100% transparent.", icon: "💰" },
                { step: "3", title: "Download OPTCGSim", desc: "Go to optcgsim.com and download the free simulator. Build your deck before the tournament.", icon: "📥" },
                { step: "4", title: "Play Your Matches", desc: "When round 1 starts, your opponent will be assigned. Share your OPTCGSim room code and play!", icon: "⚔️" },
                { step: "5", title: "Report Your Score", desc: "After each match, report the result here. Both players must confirm.", icon: "📊" },
                { step: "6", title: "Win SUI Prizes!", desc: "1st gets 50%, 2nd gets 30%, 3rd gets 20%. Prizes sent automatically to your wallet!", icon: "🏆" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#ff6b6b", flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "18px" }}>{s.icon}</span>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#e6e4f0" }}>{s.title}</div>
                    </div>
                    <p style={{ fontSize: "14px", color: "#888898", lineHeight: 1.75 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #cc0000, #ff3333)", color: "#fff", padding: "14px 40px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,50,50,0.3)" }}>🏴‍☠️ Go to OPTCGSim →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
