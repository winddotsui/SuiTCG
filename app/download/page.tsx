"use client";
import { useState } from "react";

const STEPS_MAC = [
  { step: "1", title: "Go to OPTCGSim", desc: "Visit optcgsim.com on your browser.", icon: "🌐" },
  { step: "2", title: "Download the zip file", desc: "Click Download for Mac. A zip file will download to your Downloads folder.", icon: "📥" },
  { step: "3", title: "Unzip the file", desc: "Double click the zip file to extract it. You will see the OPTCGSim app.", icon: "📦" },
  { step: "4", title: "Move to Applications", desc: "Drag OPTCGSim to your Applications folder.", icon: "📂" },
  { step: "5", title: "Fix damaged app error", desc: "Right click the app, Show Contents, go to MacOS folder, open Terminal and run the command below.", icon: "🔧" },
  { step: "6", title: "Launch and Play!", desc: "Open OPTCGSim, create an account, build your deck and start playing!", icon: "🎮" },
];

const STEPS_WIN = [
  { step: "1", title: "Go to OPTCGSim", desc: "Visit optcgsim.com on your browser.", icon: "🌐" },
  { step: "2", title: "Download the zip file", desc: "Click Download for Windows. A zip file will download to your Downloads folder.", icon: "📥" },
  { step: "3", title: "Extract the files", desc: "Right click the zip then Extract All.", icon: "📦" },
  { step: "4", title: "Run OPTCGSim.exe", desc: "Open the extracted folder and double click OPTCGSim.exe to launch.", icon: "▶️" },
  { step: "5", title: "Allow Windows Defender", desc: "If Windows blocks it, click More info then Run anyway. It is safe!", icon: "🛡️" },
  { step: "6", title: "Launch and Play!", desc: "Create an account, build your deck and start playing!", icon: "🎮" },
];

const TOURNAMENT_STEPS = [
  { step: "1", title: "Connect Your Sui Wallet", desc: "Go to wave-tcg.vercel.app and click Connect. You need a Sui wallet with at least 10 SUI.", icon: "◈", color: "#00d4ff" },
  { step: "2", title: "Go to OPTCG Hub", desc: "Click OPTCG in the navbar to see the current tournament and prize pool.", icon: "🏴", color: "#00d4ff" },
  { step: "3", title: "Pay 10 SUI Entry Fee", desc: "Click Join for 10 SUI. Your wallet will ask you to confirm. The SUI goes into the prize pool smart contract.", icon: "💰", color: "#00d4ff" },
  { step: "4", title: "Minimum 8 Players Required", desc: "Tournament starts when at least 8 players register. Maximum 64 players. Register early!", icon: "👥", color: "#00d4ff" },
  { step: "5", title: "Download OPTCGSim", desc: "Download OPTCGSim from this page. Build your deck and practice before the tournament starts.", icon: "📥", color: "#00d4ff" },
  { step: "6", title: "Wait for Round 1 Pairings", desc: "When registration closes and minimum 8 players met, pairings will be announced on the OPTCG Hub page.", icon: "📋", color: "#c8d8f0" },
  { step: "7", title: "Contact Your Opponent", desc: "Message your opponent on Discord. Share your OPTCGSim room code and play your match!", icon: "⚔️", color: "#00d4ff" },
  { step: "8", title: "Report Your Score", desc: "After the match, both players report the result. Both must confirm.", icon: "📊", color: "#00d4ff" },
  { step: "9", title: "Win SUI Prizes!", desc: "1st gets 40%, 2nd gets 25%, 3rd gets 20%. WaveTCG takes 15%. Prizes sent automatically!", icon: "🏆", color: "#00d4ff" },
];

const FAQ = [
  { q: "Is OPTCGSim free?", a: "Yes! OPTCGSim is completely free to download and play." },
  { q: "Do I need physical cards to play?", a: "No! OPTCGSim is a digital simulator. You can use any card for free." },
  { q: "What sets are available?", a: "OPTCGSim includes all sets from OP-01 through the latest releases." },
  { q: "How do I get SUI?", a: "Buy SUI on Binance, Coinbase, or Bybit. Transfer to your Sui wallet. Slush app is easiest for beginners." },
  { q: "What is the minimum and maximum players?", a: "Minimum 8 players required. Maximum 64 players. If fewer than 8 register, the tournament is cancelled and all entry fees are refunded." },
  { q: "How are prizes distributed?", a: "1st gets 40%, 2nd gets 25%, 3rd gets 20% of the pot. WaveTCG takes 15% to maintain the platform." },
  { q: "What if I cannot find my opponent?", a: "If your opponent is unresponsive for 30 minutes, report it to WaveTCG Discord and you will receive a bye." },
  { q: "When are prizes distributed?", a: "Prizes are distributed automatically via Sui smart contract after the tournament admin confirms final results." },
  { q: "What decks are allowed?", a: "All legal One Piece TCG sets OP-01 to OP-14 are allowed." },
];

export default function DownloadPage() {
  const [os, setOs] = useState("mac");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #000510 50%, #000008 100%)", padding: "24px 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,80,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>WaveTCG OPTCG Hub</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(20px, 5vw, 40px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #00d4ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "16px" }}>Download and Play Guide</h1>
        <p style={{ fontSize: "13px", color: "#c8d8f0", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.75 }}>Everything you need to download OPTCGSim and join WaveTCG weekly tournaments.</p>
        <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #00d4ff)", color: "#fff", padding: "12px 24px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,80,255,0.3)" }}>Go to OPTCGSim</a>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #000008, #050515)", border: "1px solid rgba(0,80,255,0.3)", borderRadius: "16px", padding: "14px 16px", marginBottom: "60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "20px" }}>
          {[
            { label: "Entry Fee", val: "10 SUI", icon: "💰", color: "#00d4ff" },
            { label: "Min Players", val: "8 players", icon: "👥", color: "#00d4ff" },
            { label: "Max Players", val: "64 players", icon: "🏆", color: "#00d4ff" },
            { label: "Platform Fee", val: "15% of pot", icon: "⛓️", color: "#c8d8f0" },
          ].map((info, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{info.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: info.color, marginBottom: "4px" }}>{info.val}</div>
              <div style={{ fontSize: "11px", color: "#c8d8f0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{info.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "80px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>Step 1</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "32px", color: "#ffffff", marginBottom: "8px" }}>Download OPTCGSim</h2>
          <p style={{ fontSize: "15px", color: "#c8d8f0", marginBottom: "32px" }}>Choose your operating system for step by step instructions.</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
            {[{ id: "mac", label: "Mac" }, { id: "windows", label: "Windows" }].map(o => (
              <button key={o.id} onClick={() => setOs(o.id)} style={{ padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "14px", fontWeight: 500, border: os === o.id ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.1)", background: os === o.id ? "rgba(0,80,255,0.1)" : "transparent", color: os === o.id ? "#00d4ff" : "#c8d8f0" }}>{o.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(os === "mac" ? STEPS_MAC : STEPS_WIN).map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "rgba(0,80,255,0.1)", border: "1px solid rgba(0,80,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#00d4ff" }}>{s.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>{s.title}</div>
                  </div>
                  <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
                  {s.step === "5" && os === "mac" && (
                    <div style={{ marginTop: "12px", background: "#000008", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#00d4ff" }}>
                      sudo xattr -rd com.apple.quarantine /Applications/OPTCGSim.app
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #00d4ff)", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Download OPTCGSim Now</a>
          </div>
        </div>

        <div style={{ marginBottom: "80px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>Step 2</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "32px", color: "#ffffff", marginBottom: "8px" }}>Join WaveTCG Weekly Tournament</h2>
          <p style={{ fontSize: "15px", color: "#c8d8f0", marginBottom: "32px" }}>Every week WaveTCG hosts a One Piece TCG tournament. Entry is 10 SUI.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
            {[
              { place: "1st Place", pct: "40%", icon: "🥇", color: "#00d4ff", bg: "rgba(232,201,122,0.08)", border: "rgba(232,201,122,0.2)" },
              { place: "2nd Place", pct: "25%", icon: "🥈", color: "#00d4ff", bg: "rgba(120,191,255,0.08)", border: "rgba(120,191,255,0.2)" },
              { place: "3rd Place", pct: "20%", icon: "🥉", color: "#00d4ff", bg: "rgba(0,80,255,0.08)", border: "rgba(0,80,255,0.2)" },
              { place: "WaveTCG", pct: "15%", icon: "🌊", color: "#00d4ff", bg: "rgba(0,80,255,0.08)", border: "rgba(0,80,255,0.2)" },
            ].map((p, i) => (
              <div key={i} style={{ background: p.bg, border: "1px solid " + p.border, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{p.icon}</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "11px", color: "#c8d8f0", marginBottom: "6px" }}>{p.place}</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 700, color: p.color }}>{p.pct}</div>
                <div style={{ fontSize: "10px", color: "#c8d8f0", marginTop: "4px" }}>of prize pool</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {TOURNAMENT_STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "rgba(0,80,255,0.1)", border: "1px solid rgba(0,80,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: s.color }}>{s.step}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>{s.title}</div>
                  </div>
                  <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/optcg" style={{ display: "inline-block", background: "linear-gradient(135deg, #00d4ff, #00d4ff)", color: "#000008", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Join Current Tournament</a>
            <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "transparent", color: "#c8d8f0", padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "14px", textDecoration: "none" }}>Download OPTCGSim</a>
          </div>
        </div>

        <div style={{ marginBottom: "60px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>FAQ</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "32px", color: "#ffffff", marginBottom: "32px" }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FAQ.map((faq, i) => (
              <div key={i} style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "transparent", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff" }}>{faq.q}</span>
                  <span style={{ color: "#00d4ff", fontSize: "18px", flexShrink: 0, marginLeft: "16px" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏴</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#ffffff", marginBottom: "12px" }}>Ready to become Pirate King?</h2>
          <p style={{ fontSize: "15px", color: "#c8d8f0", marginBottom: "32px" }}>Download OPTCGSim, join the WaveTCG tournament, and win SUI prizes every week!</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #00d4ff)", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Download OPTCGSim</a>
            <a href="/optcg" style={{ display: "inline-block", background: "linear-gradient(135deg, #00d4ff, #00d4ff)", color: "#000008", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Join Tournament</a>
          </div>
        </div>
      </div>
    </div>
  );
}
