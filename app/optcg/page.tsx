"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const ADMIN_WALLET = '0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5';
const PACKAGE_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const TOURNAMENT_ID = process.env.NEXT_PUBLIC_TOURNAMENT_ID || "";
const ENTRY_FEE = BigInt("10000000000");
const ENTRY_FEE_SUI = 10;

const RANKINGS: any[] = [];


function TreasureChest({ pot, players, maxPlayers }: { pot: number; players: number; maxPlayers: number }) {
  const progress = (players / maxPlayers) * 100;
  return (
    <div style={{ background: "linear-gradient(135deg, #000008, #050515)", border: "1px solid rgba(0,85,255,0.3)", borderRadius: "20px", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes tcCoinFly1{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-80px,-140px) rotate(-40deg);opacity:0}}
        @keyframes tcCoinFly2{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-20px,-160px) rotate(20deg);opacity:0}}
        @keyframes tcCoinFly3{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(50px,-150px) rotate(35deg);opacity:0}}
        @keyframes tcCoinFly4{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(100px,-130px) rotate(50deg);opacity:0}}
        @keyframes tcCoinFly5{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(130px,-100px) rotate(-20deg);opacity:0}}
        @keyframes tcCoinFly6{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-110px,-110px) rotate(-50deg);opacity:0}}
        @keyframes tcWaveSway{0%,100%{transform:scaleX(1) scaleY(1)}50%{transform:scaleX(1.03) scaleY(1.05)}}
        @keyframes tcLidOpen{0%,100%{transform:rotate(-35deg)}50%{transform:rotate(-42deg)}}
        @keyframes tcSparkle{0%,100%{opacity:0;transform:scale(0)}40%,60%{opacity:1;transform:scale(1)}}
        @keyframes tcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .tc-coin{position:absolute;width:38px;height:38px;border-radius:50%;background:#0099ff;border:2px solid #0050cc;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#5a3e00;}
        .tc-cf1{animation:tcCoinFly1 1.6s ease-in infinite 0s}
        .tc-cf2{animation:tcCoinFly2 1.6s ease-in infinite 0.2s}
        .tc-cf3{animation:tcCoinFly3 1.6s ease-in infinite 0.4s}
        .tc-cf4{animation:tcCoinFly4 1.6s ease-in infinite 0.6s}
        .tc-cf5{animation:tcCoinFly5 1.6s ease-in infinite 0.8s}
        .tc-cf6{animation:tcCoinFly6 1.6s ease-in infinite 1.0s}
        .tc-sp1{animation:tcSparkle 1.6s ease-in-out infinite 0.3s}
        .tc-sp2{animation:tcSparkle 1.6s ease-in-out infinite 0.9s}
        .tc-sp3{animation:tcSparkle 1.6s ease-in-out infinite 1.3s}
        .tc-wave{animation:tcWaveSway 3s ease-in-out infinite}
        .tc-sc{animation:tcFloat 2s ease-in-out infinite}
      `}</style>

      {/* Chest visual */}
      <div style={{ position: "relative", height: "260px", background: "transparent", overflow: "hidden" }}>

        {/* Back wave */}
        <div className="tc-wave" style={{ position: "absolute", top: "20px", left: "-10px", right: "-10px" }}>
          <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
            <path d="M0,80 C30,40 80,15 140,50 C180,70 200,20 260,15 C320,8 360,55 400,65 L400,160 L0,160 Z" fill="#1a5fa0"/>
            <path d="M0,100 C40,65 90,40 150,65 C190,80 220,35 280,28 C340,20 375,70 400,80 L400,160 L0,160 Z" fill="#0d4080" opacity="0.6"/>
            <path d="M120,55 Q140,42 160,55" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
            <path d="M240,20 Q265,8 290,20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
            <path d="M55,42 Q78,28 100,42 Q80,46 58,48" fill="white" opacity="0.5"/>
            <path d="M195,18 Q218,5 240,18 Q220,22 198,24" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {/* Left small wave */}
        <div style={{ position: "absolute", bottom: "50px", left: "0", animation: "tcWaveSway 2.5s ease-in-out infinite 0.5s" }}>
          <svg width="130" height="90" viewBox="0 0 130 90">
            <path d="M0,50 C15,25 40,12 65,35 C80,48 90,20 110,15 C120,12 128,30 130,40 L130,90 L0,90 Z" fill="#1a6fb5"/>
            <path d="M15,35 Q30,22 48,35" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
            <path d="M40,30 Q55,18 70,30 Q56,34 42,36" fill="white" opacity="0.5"/>
          </svg>
        </div>

        {/* Right small wave */}
        <div style={{ position: "absolute", bottom: "45px", right: "0", animation: "tcWaveSway 2.8s ease-in-out infinite 0.2s" }}>
          <svg width="120" height="80" viewBox="0 0 120 80">
            <path d="M0,45 C15,22 38,10 60,32 C75,44 85,18 105,12 C115,9 120,28 120,38 L120,80 L0,80 Z" fill="#1565a0"/>
            <path d="M12,30 Q28,18 45,30" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
            <path d="M55,18 Q68,8 82,18 Q68,22 56,24" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {/* Water floor */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "#0d3a70" }}>
          <svg width="100%" height="25" viewBox="0 0 400 25" preserveAspectRatio="none" style={{ position: "absolute", top: 0 }}>
            <path d="M0,12 Q50,2 100,12 Q150,22 200,12 Q250,2 300,12 Q350,22 400,12 L400,0 L0,0 Z" fill="#1a6fb5" opacity="0.6"/>
          </svg>
        </div>

        {/* Ground coins */}
        <div className="tc-sc" style={{ position: "absolute", bottom: "14px", left: "30px" }}><div className="tc-coin" style={{ width: "26px", height: "26px", fontSize: "10px" }}>$</div></div>
        <div style={{ position: "absolute", bottom: "10px", left: "65px", transform: "rotate(20deg)" }}><div className="tc-coin" style={{ width: "22px", height: "22px", fontSize: "9px" }}>$</div></div>
        <div className="tc-sc" style={{ position: "absolute", bottom: "14px", right: "35px", animationDelay: "0.5s" }}><div className="tc-coin" style={{ width: "24px", height: "24px", fontSize: "9px" }}>$</div></div>
        <div style={{ position: "absolute", bottom: "10px", right: "68px", transform: "rotate(-15deg)" }}><div className="tc-coin" style={{ width: "20px", height: "20px", fontSize: "8px" }}>$</div></div>

        {/* CHEST */}
        <div style={{ position: "absolute", bottom: "45px", left: "50%", transform: "translateX(-50%)", width: "170px" }}>

          {/* Flying coins */}
          <div className="tc-coin tc-cf1" style={{ bottom: "90px", left: "55px" }}>$</div>
          <div className="tc-coin tc-cf2" style={{ bottom: "90px", left: "75px" }}>$</div>
          <div className="tc-coin tc-cf3" style={{ bottom: "90px", left: "70px" }}>$</div>
          <div className="tc-coin tc-cf4" style={{ bottom: "90px", left: "82px" }}>$</div>
          <div className="tc-coin tc-cf5" style={{ bottom: "90px", left: "78px" }}>$</div>
          <div className="tc-coin tc-cf6" style={{ bottom: "90px", left: "60px" }}>$</div>

          {/* Sparkles */}
          <div className="tc-sp1" style={{ position: "absolute", bottom: "155px", left: "20px", color: "#ffe566", fontSize: "16px" }}>✦</div>
          <div className="tc-sp2" style={{ position: "absolute", bottom: "170px", right: "15px", color: "#fff9c4", fontSize: "12px" }}>✦</div>
          <div className="tc-sp3" style={{ position: "absolute", bottom: "185px", left: "45px", color: "#ffe566", fontSize: "10px" }}>✦</div>

          {/* Lid */}
          <div style={{ animation: "tcLidOpen 2s ease-in-out infinite", transformOrigin: "bottom center", position: "relative", zIndex: 4 }}>
            <div style={{ width: "170px", height: "55px", background: "#1565a0", borderRadius: "8px 8px 0 0", border: "3px solid #0a3d6e", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "10px", left: "8px", right: "8px", height: "3px", background: "#0f4f8a", borderRadius: "2px" }}></div>
              <div style={{ position: "absolute", top: "22px", left: "8px", right: "8px", height: "3px", background: "#0f4f8a", borderRadius: "2px" }}></div>
              <div style={{ position: "absolute", top: "4px", left: "4px", width: "14px", height: "14px", background: "#0060dd", borderRadius: "3px" }}></div>
              <div style={{ position: "absolute", top: "4px", right: "4px", width: "14px", height: "14px", background: "#0060dd", borderRadius: "3px" }}></div>
              <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "10px", background: "#0060dd", borderTop: "2px solid #00d4ff" }}></div>
            </div>
            {/* Inner lid glow */}
            <div style={{ width: "158px", height: "28px", background: "#0060dd", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#5a3e00", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" }}>SUI</span>
            </div>
          </div>

          {/* Coin pile on top of body */}
          <div style={{ position: "absolute", top: "-15px", left: "8px", right: "8px", height: "30px", zIndex: 5, display: "flex", justifyContent: "center", gap: "3px" }}>
            <div className="tc-coin" style={{ width: "32px", height: "32px", fontSize: "12px" }}>$</div>
            <div className="tc-coin" style={{ width: "34px", height: "34px", fontSize: "13px", marginTop: "-4px" }}>$</div>
            <div className="tc-coin" style={{ width: "30px", height: "30px", fontSize: "11px" }}>$</div>
            <div className="tc-coin" style={{ width: "32px", height: "32px", fontSize: "12px", marginTop: "-5px" }}>$</div>
          </div>

          {/* Body */}
          <div style={{ width: "170px", height: "85px", background: "#1a6fb5", borderRadius: "0 0 12px 12px", border: "3px solid #0a3d6e", borderTop: "none", position: "relative", overflow: "hidden", zIndex: 3 }}>
            <div style={{ position: "absolute", top: "12px", left: 0, right: 0, height: "3px", background: "#1060a0" }}></div>
            <div style={{ position: "absolute", top: "28px", left: 0, right: 0, height: "3px", background: "#1060a0" }}></div>
            <div style={{ position: "absolute", top: "44px", left: 0, right: 0, height: "3px", background: "#1060a0" }}></div>
            <div style={{ position: "absolute", top: "60px", left: 0, right: 0, height: "3px", background: "#1060a0" }}></div>
            <div style={{ position: "absolute", top: "38px", left: 0, right: 0, height: "14px", background: "#0060dd", borderTop: "2px solid #00d4ff", borderBottom: "2px solid #00d4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "22px", height: "18px", background: "#1a5fa0", borderRadius: "4px", border: "2px solid #00d4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "7px", height: "7px", background: "#00d4ff", borderRadius: "50%" }}></div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: "6px", left: "6px", width: "18px", height: "18px", background: "#0060dd", borderRadius: "3px" }}></div>
            <div style={{ position: "absolute", bottom: "6px", right: "6px", width: "18px", height: "18px", background: "#0060dd", borderRadius: "3px" }}></div>
            <div style={{ position: "absolute", top: "25px", left: "-8px", width: "12px", height: "24px", borderRadius: "3px", background: "#0060dd", border: "2px solid #003a99" }}></div>
            <div style={{ position: "absolute", top: "25px", right: "-8px", width: "12px", height: "24px", borderRadius: "3px", background: "#0060dd", border: "2px solid #003a99" }}></div>
          </div>
        </div>
      </div>

      {/* Prize info below chest */}
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0099ff", marginBottom: "8px" }}>Tournament Prize Pool</div>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: "44px", fontWeight: 900, color: "#00d4ff", lineHeight: 1, marginBottom: "4px" }}>{pot} SUI</div>
        <div style={{ fontSize: "12px", color: "#c8d8f0", marginBottom: "6px" }}>≈ ${(pot * 0.88).toFixed(0)} USD</div>
        <div style={{ fontSize: "11px", color: "#0099ff", marginBottom: "20px" }}>◈ Powered by SUI × Ethena on Sui</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
          {[
            { place: "🥇 1st", pct: 40, amount: Math.floor(pot * 0.4) },
            { place: "🥈 2nd", pct: 25, amount: Math.floor(pot * 0.25) },
            { place: "🥉 3rd", pct: 20, amount: Math.floor(pot * 0.2) },
          ].map((prize, i) => (
            <div key={i} style={{ background: "rgba(0,85,255,0.08)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "10px", padding: "12px 8px" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{prize.place.split(" ")[0]}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", color: "#0099ff", marginBottom: "6px" }}>{prize.place.split(" ")[1]}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#00d4ff" }}>{prize.amount}</div>
              <div style={{ fontSize: "9px", color: "#c8d8f0" }}>SUI · {prize.pct}%</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#c8d8f0" }}>
          <span>👥 {players}/{maxPlayers} players</span>
          <span style={{ color: "#0099ff" }}>{maxPlayers - players} spots left</span>
        </div>
        <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "3px", width: `${progress}%`, background: "linear-gradient(90deg, #0055ff, #0099ff)", transition: "width 0.5s ease" }} />
        </div>
      </div>
    </div>
  );
}


function JoinModal({ onClose, onJoin, pot, prefillDeck }: { onClose: () => void; onJoin: (name: string, deck: string, deckName: string, txDigest?: string, walletAddress?: string) => void; pot: number; prefillDeck?: {name: string, decklist: string, leader: string} | null }) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const isAdmin = account?.address === ADMIN_WALLET;
  const [step, setStep] = useState<"form" | "confirm" | "paying" | "success">("confirm");
  const [walletConnected, setWalletConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [deckName, setDeckName] = useState(prefillDeck?.name || "");
  const [decklist, setDecklist] = useState(prefillDeck?.decklist || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillDeck) {
      setDeckName(prefillDeck.name);
      setDecklist(prefillDeck.decklist);
    }
  }, [prefillDeck]);

  async function handleJoin() {
    if (!account) { alert("Please connect your Sui wallet first!"); return; }
    setStep("paying");
    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [ENTRY_FEE]);
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::join_tournament`,
        arguments: [tx.object(TOURNAMENT_ID), coin],
      });
      const result = await signAndExecute({ transaction: tx });
      console.log("TX:", result.digest);
      setStep("success");
      setTimeout(() => { onJoin(playerName, decklist, deckName, result.digest, account?.address || 'anonymous'); onClose(); }, 1500);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Transaction failed.");
      setStep("form");
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#050515", border: "1px solid rgba(0,85,255,0.3)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "420px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#c8d8f0", fontSize: "18px", cursor: "pointer" }}>✕</button>
        {step === "confirm" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💰</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#ffffff", marginBottom: "8px" }}>Join Tournament</h2>
              <p style={{ fontSize: "13px", color: "#c8d8f0" }}>WaveTCG Weekly OPTCG Tournament</p>
            </div>
            <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "Entry Fee", val: "10 SUI", color: "#00d4ff" },
                { label: "Min Players", val: "8 players", color: "#0099ff" },
                { label: "Max Players", val: "64 players", color: "#0099ff" },
                { label: "Current Pot", val: `${pot} SUI`, color: "#0099ff" },
                { label: "1st Prize", val: `${Math.floor((pot + 10) * 0.5)} SUI`, color: "#0099ff" },
                { label: "2nd Prize", val: `${Math.floor((pot + 10) * 0.3)} SUI`, color: "#00d4ff" },
                { label: "3rd Prize", val: `${Math.floor((pot + 10) * 0.2)} SUI`, color: "#0099ff" },
                { label: "Payment", val: "On-chain via Sui", color: "#c8d8f0" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize: "13px", color: "#c8d8f0" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
            {account ? (
              <div style={{ background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#0099ff", textAlign: "center", marginBottom: "10px" }}>✅ {account.address.slice(0,8)}...{account.address.slice(-6)}</div>
            ) : (
              <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#ff6b6b", textAlign: "center", marginBottom: "10px" }}>⚠️ Connect your Sui wallet first</div>
            )}
            <button onClick={handleJoin} disabled={!account} style={{ width: "100%", background: account ? "linear-gradient(135deg, #0099ff, #00d4ff)" : "rgba(255,255,255,0.05)", color: account ? "#000008" : "#8899bb", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: account ? "pointer" : "not-allowed", fontFamily: "DM Sans, sans-serif" }}>
              💰 Pay 10 SUI & Join
            </button>
            <p style={{ fontSize: "11px", color: "#8899bb", textAlign: "center", marginTop: "12px" }}>Payment held on-chain · Auto-distributed to winners</p>
          </>
        )}
        {step === "paying" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#ffffff", marginBottom: "8px" }}>Processing Payment</h2>
            <p style={{ fontSize: "13px", color: "#c8d8f0" }}>Sending 10 SUI to tournament escrow...</p>
          </div>
        )}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏴‍☠️</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#ffffff", marginBottom: "8px" }}>You're In!</h2>
            <p style={{ fontSize: "13px", color: "#0099ff", marginBottom: "8px" }}>✅ 10 SUI paid successfully</p>
            <p style={{ fontSize: "13px", color: "#c8d8f0" }}>Good luck, Pirate! 🏆</p>
          </div>
        )}
      </div>
    </div>
  );
}


function PlacementRow({ place, registrations, tournamentId, onUpdate }: { place: number; registrations: any[]; tournamentId: string; onUpdate: () => void }) {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const placePoints = place === 1 ? 500 : place === 2 ? 300 : 200;
  const placeLabel = place === 1 ? "🥇 1st" : place === 2 ? "🥈 2nd" : "🥉 3rd";

  async function award() {
    if (!selected) return;
    setSaving(true);
    await supabase.rpc("award_placement_points", {
      p_wallet_address: selected,
      p_placement: place,
      p_tournament_id: tournamentId,
    });
    setSaving(false);
    onUpdate();
    alert(`${placeLabel} place awarded to ${selected.slice(0,8)}...`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "14px", minWidth: "50px" }}>{placeLabel}</span>
      <span style={{ fontSize: "11px", color: "#00d4ff", minWidth: "80px" }}>+{placePoints} pts</span>
      <select value={selected} onChange={e => setSelected(e.target.value)}
        style={{ flex: 1, background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
        <option value="">Select player...</option>
        {registrations.map(r => (
          <option key={r.id} value={r.wallet_address}>
            {r.player_name || r.wallet_address.slice(0,12)}
          </option>
        ))}
      </select>
      <button onClick={award} disabled={!selected || saving}
        style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
        {saving ? "..." : "Award"}
      </button>
    </div>
  );
}

function OPTCGHubInner({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState("tournament");
  const [showSimulator, setShowSimulator] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [bracketData, setBracketData] = useState<any>(null);
  const [bracketLoading, setBracketLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [players, setPlayers] = useState(0);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [prefillDeck, setPrefillDeck] = useState<{name: string, decklist: string, leader: string} | null>(null);
  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchBracket() {
    setBracketLoading(true);
    try {
      const res = await fetch("/api/tournament");
      const json = await res.json();
      setBracketData(json);
    } catch {}
    setBracketLoading(false);
  }

  async function startTournament() {
    if (!confirm("Start tournament and generate Round 1 pairings?")) return;
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
    const json = await res.json();
    if (json.success) { alert("Round 1 pairings generated!"); fetchBracket(); fetchRegistrations(); }
    else alert(json.error || "Failed to start tournament");
  }

  async function nextRound() {
    if (!confirm("Generate next round pairings?")) return;
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next_round" }),
    });
    const json = await res.json();
    if (json.success) { alert(`Round ${json.round} pairings generated!`); fetchBracket(); }
    else alert(json.error || "Failed");
  }

  async function reportResult(matchId: string, winnerWallet: string, p1Score: number, p2Score: number) {
    const myAddr = account?.address || "";
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "report_result",
        data: { match_id: matchId, winner_wallet: winnerWallet, player1_score: p1Score, player2_score: p2Score, reporter: myAddr }
      }),
    });
    const json = await res.json();
    if (json.success) { alert("Result reported!"); fetchBracket(); }
    else alert("Failed to report result");
  }

  async function fetchRegistrations() {
    try {
      const PACKAGE = process.env.NEXT_PUBLIC_CONTRACT_ID;
      const TOURNAMENT = process.env.NEXT_PUBLIC_TOURNAMENT_ID;
      const res = await fetch("https://fullnode.testnet.sui.io:443", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: 1, method: "suix_queryEvents",
          params: [{ MoveEventType: `${PACKAGE}::marketplace::TournamentJoined` }, null, 100, true]
        })
      });
      const json = await res.json();
      const events = json.result?.data || [];
      const filtered = events.filter((e: any) => {
        const parsed = e.parsedJson as any;
        return parsed?.tournament_id === TOURNAMENT;
      });
      const wallets = filtered.map((e: any) => (e.parsedJson as any).participant);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("wallet_address, username, avatar_url")
        .in("wallet_address", wallets);
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.wallet_address] = p; });

      const chainParticipants = filtered.map((e: any) => {
        const parsed = e.parsedJson as any;
        const wallet = parsed.participant;
        const profile = profileMap[wallet];
        return {
          id: e.id.txDigest,
          player_name: profile?.username || (wallet.slice(0, 8) + "..." + wallet.slice(-6)),
          avatar_url: profile?.avatar_url || null,
          wallet_address: wallet,
          deck_name: "On-chain",
          status: "registered",
          registered_at: e.timestampMs,
          tx_digest: e.id.txDigest,
        };
      });
      setRegistrations(chainParticipants);
      setPlayers(chainParticipants.length);
    } catch (err) {
      console.error("Failed to fetch from chain:", err);
    }
  }  const maxPlayers = 64;
  const pot = players * ENTRY_FEE_SUI;

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000008 50%, #000008 100%)", padding: "28px 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,85,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>🏴‍☠️ WaveTCG · One Piece TCG Hub</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(22px, 5vw, 60px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #0099ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "16px" }}>One Piece TCG Hub</h1>
        <p style={{ fontSize: "16px", color: "#c8d8f0", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.75 }}>Play online, compete for real SUI prizes, climb the rankings.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowSimulator(true)} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 24px rgba(0,85,255,0.3)" }}>⚔️ Play OPTCGSim</button>
          <button onClick={() => setShowJoin(true)} style={{ background: "linear-gradient(135deg, #0099ff, #00d4ff)", color: "#000008", border: "none", borderRadius: "8px", padding: "14px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 24px rgba(0,85,255,0.3)" }}>💰 Join Weekly Tournament</button>
        </div>
      </div>

      {showSimulator && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#050515", border: "1px solid rgba(0,85,255,0.3)", borderRadius: "16px", width: "100%", maxWidth: "500px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a1628" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>🏴‍☠️ OPTCGSim</div>
              <button onClick={() => setShowSimulator(false)} style={{ background: "transparent", border: "none", color: "#c8d8f0", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏴‍☠️</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#ffffff", marginBottom: "12px" }}>OPTCGSim</h2>
              <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75, marginBottom: "32px" }}>Free fan-made One Piece TCG simulator. Practice your decks and compete worldwide.</p>
              <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "14px 40px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,85,255,0.3)" }}>🏴‍☠️ Launch OPTCGSim →</a>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 24px" }}>
          <button onClick={() => setShowAdmin(!showAdmin)} style={{ background: "rgba(255,50,50,0.1)", color: "#ff6b6b", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
            🔧 Admin Panel
          </button>
          {showAdmin && (
            <div style={{ marginTop: "12px", background: "#050515", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "12px", padding: "20px" }}>
              <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ff6b6b", marginBottom: "16px" }}>🏆 Award Tournament Placements</h3>
              <p style={{ fontSize: "12px", color: "#8899bb", marginBottom: "16px" }}>1st = +500pts, 2nd = +300pts, 3rd = +200pts (on top of 100 base points)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[1, 2, 3].map(place => (
                  <PlacementRow key={place} place={place} registrations={registrations} tournamentId="weekly-18" onUpdate={fetchRegistrations} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showJoin && <JoinModal 
        prefillDeck={prefillDeck}
        onClose={() => { setShowJoin(false); setPrefillDeck(null); }} 
        onJoin={async (name: string, decklist: string, deckName: string, txDigest?: string) => {
        setPlayers(p => p + 1);
        const addr = localStorage.getItem("wavetcg_wallet_address") || localStorage.getItem("connected_wallet") || (typeof window !== 'undefined' ? (document.querySelector('[data-testid="connect-button"]') as any)?.textContent : '') || "anonymous";
        await supabase.from("tournament_registrations").insert({
          tournament_id: "weekly-18",
          player_name: name,
          wallet_address: addr,
          decklist: decklist,
          deck_name: deckName,
          status: "registered",
          tx_digest: txDigest || "",
          points: 100,
          wins: 0,
          losses: 0,
        });
        fetchRegistrations();
      }} pot={pot} />}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "20px", overflowX: "auto" }}>
          {[
            { id: "tournament", label: "💰 Weekly Tournament" },
            { id: "participants", label: "👥 Participants" },
            { id: "rankings", label: "🏆 Rankings" },
            { id: "bracket", label: "⚔️ Bracket" },
            { id: "howtoplay", label: "📖 How to Play" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 24px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? "2px solid #0099ff" : "2px solid transparent", color: activeTab === tab.id ? "#00d4ff" : "#c8d8f0", fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", marginBottom: "-1px" }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "tournament" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))", gap: "24px", alignItems: "start" }}>
            <div>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#ffffff" }}>WaveTCG Weekly #17</h2>
                  <span style={{ padding: "4px 12px", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "20px", fontSize: "11px", color: "#0099ff" }}>🟢 Open</span>
                </div>
                <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75 }}>Weekly One Piece TCG tournament. Pay 10 SUI to enter. Winners automatically receive SUI prizes on-chain.</p>
              </div>

              <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "16px" }}>📋 Tournament Rules</div>
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
                    <span style={{ fontSize: "13px", color: "#c8d8f0", lineHeight: 1.6 }}>{r.rule}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff", marginBottom: "16px" }}>📅 Schedule</div>
                {[
                  { time: "Now — Apr 5", event: "Registration Open", status: "active" },
                  { time: "Apr 5, 6PM PHT", event: "Registration Closes", status: "upcoming" },
                  { time: "Apr 5, 7PM PHT", event: "Round 1 Begins", status: "upcoming" },
                  { time: "Apr 5, 10PM PHT", event: "Top 8 Announced", status: "upcoming" },
                  { time: "Apr 6, 7PM PHT", event: "Top 8 Matches", status: "upcoming" },
                  { time: "Apr 6, 11PM PHT", event: "Winners & Prize Distribution", status: "upcoming" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.status === "active" ? "#0099ff" : "#333", flexShrink: 0, boxShadow: s.status === "active" ? "0 0 8px #0099ff" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: s.status === "active" ? "#ffffff" : "#c8d8f0" }}>{s.event}</div>
                      <div style={{ fontSize: "11px", color: "#8899bb" }}>{s.time}</div>
                    </div>
                    {s.status === "active" && <span style={{ fontSize: "10px", color: "#0099ff", padding: "2px 8px", background: "rgba(0,85,255,0.1)", borderRadius: "10px" }}>Now</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "sticky", top: "80px" }}>
              <TreasureChest pot={pot} players={players} maxPlayers={maxPlayers} />
              <button onClick={() => setShowJoin(true)} style={{ width: "100%", marginTop: "16px", background: "linear-gradient(135deg, #0099ff, #00d4ff)", color: "#000008", border: "none", borderRadius: "12px", padding: "18px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: "0 8px 32px rgba(0,85,255,0.3)" }}>
                💰 Join for 10 SUI
              </button>
              <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "#8899bb" }}>⛓️ Powered by Sui Blockchain · Auto-distributed to winners</div>

              <div style={{ marginTop: "20px", background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "12px", color: "#c8d8f0", marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Registrations</div>
                {[].map((p: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#00d4ff", fontFamily: "Cinzel, serif" }}>{p[0]}</div>
                    <span style={{ fontSize: "13px", color: "#c8d8f0" }}>{p}</span>
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#0099ff" }}>✓ Paid</span>
                  </div>
                ))}
                <div style={{ textAlign: "center", marginTop: "8px", fontSize: "12px", color: "#8899bb" }}>+{players - 5} more registered</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "participants" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#ffffff", marginBottom: "4px" }}>Registered Players</h2>
                <p style={{ fontSize: "13px", color: "#c8d8f0" }}>WaveTCG Weekly #17 · {players} players registered</p>
              </div>
              <button onClick={() => setShowJoin(true)} style={{ background: "linear-gradient(135deg, #0099ff, #00d4ff)", color: "#000008", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>+ Join Tournament</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Players", val: players, icon: "👥" },
                { label: "Spots Left", val: maxPlayers - players, icon: "🎯" },
                { label: "Prize Pool", val: `${pot} SUI`, icon: "💰" },
                { label: "Min Players", val: "8", icon: "👥" },
                { label: "Status", val: "Open", icon: "🟢" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{stat.icon}</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#0099ff", marginBottom: "4px" }}>{stat.val}</div>
                  <div style={{ fontSize: "10px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 120px 140px", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8899bb" }}>
                <div>#</div>
                <div>Player</div>
                <div>Deck</div>
                <div style={{ textAlign: "center" }}>Status</div>
                <div style={{ textAlign: "right" }}>Registered</div>
              </div>

              {registrations.length > 0 ? registrations.map((reg, i) => (
                <div key={reg.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 120px 140px", padding: "18px 24px", alignItems: "center", borderBottom: i < registrations.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#c8d8f0" }}>#{i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(0,85,255,0.15)", border: "1px solid rgba(0,85,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {reg.avatar_url
                        ? <img src={reg.avatar_url} alt={reg.player_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#00d4ff" }}>{reg.player_name[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff" }}>{reg.player_name}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#c8d8f0" }}>{reg.deck_name || "—"}</div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ padding: "4px 12px", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "12px", fontSize: "11px", color: "#0099ff" }}>✓ Paid</span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "12px", color: "#8899bb" }}>
                    {new Date(reg.registered_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              )) : (
                [].map((player: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 120px 140px", padding: "18px 24px", alignItems: "center", borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#c8d8f0" }}>#{i + 1}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(0,85,255,0.15)", border: "1px solid rgba(0,85,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", color: "#00d4ff", flexShrink: 0 }}>
                        {player[0]}
                      </div>
                      <span style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#ffffff" }}>{player}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#c8d8f0" }}>OP0{(i % 4) + 1} Deck</div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ padding: "4px 12px", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "12px", fontSize: "11px", color: "#0099ff" }}>✓ Paid</span>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "12px", color: "#8899bb" }}>Apr 1, 2026</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button onClick={() => setShowJoin(true)} style={{ background: "linear-gradient(135deg, #0099ff, #00d4ff)", color: "#000008", border: "none", borderRadius: "12px", padding: "16px 40px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                💰 Join for 10 SUI
              </button>
            </div>
          </div>
        )}

        {activeTab === "rankings" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#ffffff", marginBottom: "4px" }}>Global Rankings</h2>
                <p style={{ fontSize: "13px", color: "#c8d8f0" }}>Updated after every tournament · Season 1</p>
              </div>
              <div style={{ padding: "6px 14px", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", borderRadius: "20px", fontSize: "12px", color: "#00d4ff" }}>🔴 Live</div>
            </div>
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8899bb" }}>
                <div>Rank</div><div>Player</div><div>Deck</div><div style={{ textAlign: "center" }}>Record</div><div style={{ textAlign: "right" }}>Points</div><div style={{ textAlign: "right" }}>Change</div>
              </div>
              {RANKINGS.map((player, i) => (
                <div key={player.rank} style={{ display: "grid", gridTemplateColumns: "60px 1fr 140px 100px 100px 80px", padding: "14px 20px", alignItems: "center", borderBottom: i < RANKINGS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#0a1628"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px" }}>{player.badge}</span>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#c8d8f0" }}>#{player.rank}</span>
                  </div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff" }}>{player.player}</div>
                  <div style={{ fontSize: "11px", color: "#c8d8f0" }}>{player.deck}</div>
                  <div style={{ textAlign: "center", fontSize: "12px" }}>
                    <span style={{ color: "#0099ff" }}>{player.wins}W</span><span style={{ color: "#8899bb" }}> · </span><span style={{ color: "#0099ff" }}>{player.losses}L</span>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#0099ff" }}>{player.points.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontSize: "12px", color: player.change.startsWith("+") ? "#0099ff" : player.change === "0" ? "#c8d8f0" : "#0099ff" }}>{player.change === "0" ? "—" : player.change}</div>
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab === "bracket" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#ffffff", marginBottom: "4px" }}>⚔️ Tournament Bracket</h2>
                <p style={{ fontSize: "13px", color: "#c8d8f0" }}>Swiss format · {bracketData?.state?.total_rounds || 4} rounds</p>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: "8px" }}>
                  {!bracketData?.state || bracketData?.state?.status === "registration" ? (
                    <button onClick={startTournament} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                      🚀 Start Tournament
                    </button>
                  ) : (
                    <button onClick={nextRound} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                      ➡️ Next Round
                    </button>
                  )}
                </div>
              )}
            </div>

            {bracketLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#0099ff" }}>Loading...</div>
            ) : !bracketData?.matches?.length ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#8899bb" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚔️</div>
                <p>Tournament hasn't started yet.</p>
                {isAdmin && <p style={{ fontSize: "12px", marginTop: "8px", color: "#444460" }}>Click "Start Tournament" to generate pairings.</p>}
              </div>
            ) : (
              <div>
                {/* Group matches by round */}
                {Array.from(new Set(bracketData.matches.map((m: any) => m.round))).map((round: any) => {
                  const roundMatches = bracketData.matches.filter((m: any) => m.round === round);
                  return (
                    <div key={round} style={{ marginBottom: "32px" }}>
                      <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#00d4ff", marginBottom: "16px" }}>Round {round}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {roundMatches.map((match: any) => {
                          const myWallet = account?.address;
                          const isMyMatch = match.player1_wallet === myWallet || match.player2_wallet === myWallet;
                          const p1 = bracketData.standings?.find((s: any) => s.wallet_address === match.player1_wallet);
                          const p2 = bracketData.standings?.find((s: any) => s.wallet_address === match.player2_wallet);

                          return (
                            <div key={match.id} style={{ background: isMyMatch ? "rgba(0,153,255,0.08)" : "#050515", border: `1px solid ${isMyMatch ? "rgba(0,153,255,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                {/* Player 1 */}
                                <div style={{ flex: 1, textAlign: "right" }}>
                                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: match.winner_wallet === match.player1_wallet ? "#00ff88" : "#fff" }}>
                                    {p1?.player_name || match.player1_wallet?.slice(0, 8) + "..."}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#8899bb" }}>{p1?.match_wins || 0}W</div>
                                </div>

                                {/* Score */}
                                <div style={{ textAlign: "center", minWidth: "60px" }}>
                                  {match.status === "completed" ? (
                                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#0099ff" }}>
                                      {match.player1_score} - {match.player2_score}
                                    </div>
                                  ) : match.status === "bye" ? (
                                    <div style={{ fontSize: "12px", color: "#8899bb" }}>BYE</div>
                                  ) : (
                                    <div style={{ fontSize: "12px", color: "#444460" }}>vs</div>
                                  )}
                                </div>

                                {/* Player 2 */}
                                <div style={{ flex: 1 }}>
                                  {match.player2_wallet ? (
                                    <>
                                      <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: match.winner_wallet === match.player2_wallet ? "#00ff88" : "#fff" }}>
                                        {p2?.player_name || match.player2_wallet?.slice(0, 8) + "..."}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "#8899bb" }}>{p2?.match_wins || 0}W</div>
                                    </>
                                  ) : (
                                    <div style={{ fontSize: "13px", color: "#8899bb" }}>BYE</div>
                                  )}
                                </div>

                                {/* Report Result */}
                                {isMyMatch && match.status === "pending" && match.player2_wallet && (
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button onClick={() => reportResult(match.id, match.player1_wallet, 2, 0)}
                                      style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "6px", padding: "6px 10px", fontSize: "11px", cursor: "pointer" }}>
                                      {match.player1_wallet === myWallet ? "I Won" : "They Won (P1)"}
                                    </button>
                                    <button onClick={() => reportResult(match.id, match.player2_wallet, 0, 2)}
                                      style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "6px", padding: "6px 10px", fontSize: "11px", cursor: "pointer" }}>
                                      {match.player2_wallet === myWallet ? "I Won" : "They Won (P2)"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Standings */}
                {bracketData.standings?.length > 0 && (
                  <div style={{ marginTop: "32px" }}>
                    <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "16px", color: "#00d4ff", marginBottom: "16px" }}>📊 Current Standings</h3>
                    <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                      {bracketData.standings.map((player: any, i: number) => (
                        <div key={player.wallet_address} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < bracketData.standings.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                          <div style={{ width: "28px", fontFamily: "Cinzel, serif", fontSize: "13px", color: "#8899bb" }}>#{i+1}</div>
                          <div style={{ flex: 1, fontSize: "13px", color: "#fff" }}>{player.player_name || player.wallet_address?.slice(0,8) + "..."}</div>
                          <div style={{ fontSize: "13px", color: "#00d4ff", fontWeight: 700 }}>{player.match_wins}W</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "howtoplay" && (
          <div style={{ maxWidth: "700px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#ffffff", marginBottom: "32px" }}>How to Join & Play</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { step: "1", title: "Connect Your Sui Wallet", desc: "Click Connect in the navbar. You need a Sui wallet with at least 10 SUI to enter.", icon: "◈" },
                { step: "2", title: "Pay 10 SUI Entry Fee", desc: "Click Join for 10 SUI. Payment is held in smart contract escrow — 100% transparent.", icon: "💰" },
                { step: "3", title: "Download OPTCGSim", desc: "Go to optcgsim.com and download the free simulator. Build your deck before the tournament.", icon: "📥" },
                { step: "4", title: "Play Your Matches", desc: "When round 1 starts, your opponent will be assigned. Share your OPTCGSim room code and play!", icon: "⚔️" },
                { step: "5", title: "Report Your Score", desc: "After each match, report the result here. Both players must confirm.", icon: "📊" },
                { step: "6", title: "Win SUI Prizes!", desc: "1st gets 50%, 2nd gets 30%, 3rd gets 20%. Prizes sent automatically to your wallet!", icon: "🏆" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(0,85,255,0.1)", border: "1px solid rgba(0,85,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#00d4ff", flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "18px" }}>{s.icon}</span>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>{s.title}</div>
                    </div>
                    <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", padding: "14px 40px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,85,255,0.3)" }}>🏴‍☠️ Go to OPTCGSim →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OPTCGHubWrapper() {
  const account = useCurrentAccount();
  return <OPTCGHubInner isAdmin={account?.address === ADMIN_WALLET} />;
}

export default function OPTCGHub() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <OPTCGHubWrapper />;
}
