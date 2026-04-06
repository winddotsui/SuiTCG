"use client";
import { useState } from "react";

const TABS = [
  { id: "trade", label: "🛒 How to Trade" },
  { id: "wallet", label: "◈ Create a Wallet" },
  { id: "play", label: "🏴\u200d☠️ How to Play" },
  { id: "faq", label: "❓ FAQ" },
];

const WALLET_STEPS = [
  { step: "1", icon: "📱", title: "Download Slush Wallet", desc: "Slush is the easiest Sui wallet. Download it from the App Store (iOS) or Google Play (Android). It's free." },
  { step: "2", icon: "🔑", title: "Create a New Wallet", desc: "Open Slush and tap Create New Wallet. Write down your 12-word seed phrase on paper and keep it safe. Never share it with anyone." },
  { step: "3", icon: "💰", title: "Buy SUI", desc: "Buy SUI on Binance, Coinbase, or Bybit. You need at least 1 SUI to list cards (for gas fees). You need 10 SUI to join tournaments." },
  { step: "4", icon: "📤", title: "Transfer SUI to Your Wallet", desc: "Copy your Slush wallet address. On your exchange, go to Withdraw, paste your address, select Sui network, confirm." },
  { step: "5", icon: "🌊", title: "Connect to WaveTCG", desc: "Go to wavetcgmarket.com and click Connect. Select Slush from the wallet list. Approve the connection and you're ready!" },
];

const LISTING_STEPS = [
  { step: "1", icon: "🔗", title: "Connect Your Wallet", desc: "Click Connect in the top right. You need a Sui wallet connected to list cards." },
  { step: "2", icon: "✅", title: "Verify Your Socials", desc: "Go to your Profile and connect at least 2 of: Twitter, Discord, or Telegram. This is required to sell cards and prevents scams." },
  { step: "3", icon: "🃏", title: "Go to Sell Page", desc: "Click Sell in the navbar. Select your game, enter the card name, condition, and set your price in USD (we convert to SUI automatically)." },
  { step: "4", icon: "📸", title: "Upload a Card Photo", desc: "Take a clear photo of your card. Upload it on the sell page. Good photos get more buyers." },
  { step: "5", icon: "⛓️", title: "List On-Chain", desc: "Click List Card. Your wallet will ask you to confirm the transaction. A small gas fee (~0.01 SUI) is charged. Your card is now live!" },
  { step: "6", icon: "📦", title: "Wait for a Buyer", desc: "When someone buys your card, you get an email with their shipping details. Pack the card and ship it to them." },
];

const PAYMENT_STEPS = [
  { step: "1", icon: "🛒", title: "Buyer Purchases Your Card", desc: "When a buyer clicks Buy, the SUI is locked in a smart contract instantly. You get notified by email." },
  { step: "2", icon: "📧", title: "Check Your Email", desc: "You'll receive an email with the buyer's full shipping details: name, address, phone, and any notes." },
  { step: "3", icon: "📦", title: "Ship the Card", desc: "Pack your card securely in a sleeve and toploader. Ship to the buyer's address. Use a tracked shipping method." },
  { step: "4", icon: "✅", title: "Buyer Confirms Receipt", desc: "Once the buyer confirms they received the card, the SUI is released to your wallet automatically." },
  { step: "5", icon: "💰", title: "Receive Your SUI", desc: "99% of the sale goes to you. 1% platform fee is taken automatically by the smart contract. No waiting, no manual payout." },
];

const SHIPPING_TIPS = [
  { icon: "🛡️", title: "Always Use a Sleeve + Toploader", desc: "Put the card in a penny sleeve first, then a toploader. This protects it from bending and moisture." },
  { icon: "✉️", title: "Use a Rigid Mailer or Box", desc: "Never send cards in a regular envelope. Use a rigid bubble mailer or small box so it does not bend in transit." },
  { icon: "📮", title: "Use Tracked Shipping", desc: "Always use a shipping method with tracking. If the buyer claims non-delivery, you need proof of shipment." },
  { icon: "📸", title: "Photo Before Shipping", desc: "Take a photo of the packed card before sealing. This protects you if the buyer claims the card was damaged." },
  { icon: "⏱️", title: "Ship Within 3 Days", desc: "Ship within 3 business days of receiving the order. Fast shipping = good reputation = more sales." },
];

const PLAY_STEPS_MAC = [
  { step: "1", icon: "🌐", title: "Go to OPTCGSim", desc: "Visit optcgsim.com on your browser." },
  { step: "2", icon: "📥", title: "Download for Mac", desc: "Click Download for Mac. A zip file will download to your Downloads folder." },
  { step: "3", icon: "📦", title: "Unzip the File", desc: "Double click the zip file to extract it. You will see the OPTCGSim app." },
  { step: "4", icon: "📂", title: "Move to Applications", desc: "Drag OPTCGSim to your Applications folder." },
  { step: "5", icon: "🔧", title: "Fix Damaged App Error", desc: "Right click the app, Show Contents, go to MacOS folder, open Terminal and run the command below.", cmd: "sudo xattr -rd com.apple.quarantine /Applications/OPTCGSim.app" },
  { step: "6", icon: "🎮", title: "Launch and Play!", desc: "Open OPTCGSim, create an account, build your deck and start playing!" },
];

const PLAY_STEPS_WIN = [
  { step: "1", icon: "🌐", title: "Go to OPTCGSim", desc: "Visit optcgsim.com on your browser." },
  { step: "2", icon: "📥", title: "Download for Windows", desc: "Click Download for Windows. A zip file will download to your Downloads folder." },
  { step: "3", icon: "📦", title: "Extract the Files", desc: "Right click the zip then Extract All." },
  { step: "4", icon: "▶️", title: "Run OPTCGSim.exe", desc: "Open the extracted folder and double click OPTCGSim.exe to launch." },
  { step: "5", icon: "🛡️", title: "Allow Windows Defender", desc: "If Windows blocks it, click More info then Run anyway. It is safe!" },
  { step: "6", icon: "🎮", title: "Launch and Play!", desc: "Create an account, build your deck and start playing!" },
];

const FAQ = [
  { q: "Do I need SUI to list a card?", a: "Yes, a tiny gas fee (~0.01 SUI) is needed to list on-chain. The listing itself is free." },
  { q: "How do I get SUI?", a: "Buy SUI on Binance, Coinbase, or Bybit. Transfer to your Slush wallet using the Sui network." },
  { q: "What wallets work with WaveTCG?", a: "Any Sui wallet works: Slush (recommended for beginners), Sui Wallet, Nightly, and more. You can also use Google login via zkLogin." },
  { q: "How long until I get paid?", a: "Payment is instant once the buyer confirms receipt. The SUI goes straight to your wallet." },
  { q: "What is the platform fee?", a: "WaveTCG charges 1% only when your card sells. Listing is completely free." },
  { q: "What if a buyer does not pay?", a: "Payment is locked in the smart contract the moment they click Buy. There is no way to buy without paying." },
  { q: "Can I cancel a listing?", a: "Yes, you can cancel your listing anytime from your dashboard as long as it has not been purchased." },
  { q: "What cards can I sell?", a: "Any TCG card: One Piece, Pokemon, Magic: The Gathering, Yu-Gi-Oh!, and more." },
  { q: "Is OPTCGSim free?", a: "Yes! OPTCGSim is completely free to download and play." },
  { q: "What is the tournament entry fee?", a: "10 SUI per player. Prizes: 1st gets 40%, 2nd gets 25%, 3rd gets 20%. WaveTCG takes 15%." },
];

function StepCard({ s }: { s: any }) {
  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "rgba(0,80,255,0.1)", border: "1px solid rgba(0,80,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#00d4ff" }}>{s.step}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "20px" }}>{s.icon}</span>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "15px", color: "#ffffff" }}>{s.title}</div>
        </div>
        <p style={{ fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
        {s.cmd && <div style={{ marginTop: "12px", background: "#000008", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#00d4ff" }}>{s.cmd}</div>}
      </div>
    </div>
  );
}

export default function GuidePage() {
  const [tab, setTab] = useState("trade");
  const [os, setOs] = useState("mac");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#000008" }}>
      <div style={{ background: "linear-gradient(180deg, #000008 0%, #050515 100%)", padding: "48px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "12px" }}>WaveTCG Guide</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 900, background: "linear-gradient(135deg, #0055ff, #00d4ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "12px" }}>Everything You Need to Know</h1>
        <p style={{ fontSize: "14px", color: "#8899bb", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.75 }}>How to create a wallet, list cards, get paid, ship safely, and join tournaments.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "4px", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 20px", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #00d4ff" : "2px solid transparent", color: tab === t.id ? "#00d4ff" : "#666680", fontSize: "13px", fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "48px 24px" }}>

        {tab === "trade" && (
          <div>
            <section style={{ marginBottom: "60px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>Step by Step</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>How to List a Card</h2>
              <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "24px", lineHeight: 1.75 }}>List any TCG card for free. Pay only 1% when it sells.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {LISTING_STEPS.map((s, i) => <StepCard key={i} s={s} />)}
              </div>
              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <a href="/sell" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #00d4ff)", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>List a Card Now</a>
              </div>
            </section>
            <section style={{ marginBottom: "60px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>Getting Paid</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>How Payment Works</h2>
              <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "24px", lineHeight: 1.75 }}>Payment is secured on Sui blockchain. No PayPal chargebacks, no scams.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {PAYMENT_STEPS.map((s, i) => <StepCard key={i} s={s} />)}
              </div>
            </section>
            <section>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>Shipping</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>How to Ship Safely</h2>
              <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "24px", lineHeight: 1.75 }}>Protect your cards and your reputation.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {SHIPPING_TIPS.map((tip, i) => (
                  <div key={i} style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>{tip.icon}</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#fff", marginBottom: "8px" }}>{tip.title}</div>
                    <p style={{ fontSize: "13px", color: "#8899bb", lineHeight: 1.75, margin: 0 }}>{tip.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "wallet" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>Beginner Friendly</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>Create a Sui Wallet</h2>
            <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "24px", lineHeight: 1.75 }}>You need a Sui wallet to buy, sell, and join tournaments on WaveTCG.</p>
            <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#00ff88", marginBottom: "4px" }}>No crypto experience needed</div>
                <p style={{ fontSize: "13px", color: "#8899bb", margin: 0, lineHeight: 1.75 }}>Slush wallet is beginner-friendly and takes less than 5 minutes to set up. You can also use Google Login on WaveTCG without a wallet.</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {WALLET_STEPS.map((s, i) => <StepCard key={i} s={s} />)}
            </div>
            <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", color: "#ff6b6b", marginBottom: "8px" }}>⚠️ Keep Your Seed Phrase Safe</div>
              <p style={{ fontSize: "13px", color: "#8899bb", margin: 0, lineHeight: 1.75 }}>Your 12-word seed phrase is the only way to recover your wallet. Never share it with anyone. WaveTCG will never ask for it.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              {[
                { name: "Slush", desc: "Best for beginners. Mobile app.", link: "https://slush.app", rec: true },
                { name: "Sui Wallet", desc: "Official Sui browser extension.", link: "https://suiwallet.com", rec: false },
                { name: "Nightly", desc: "Multi-chain wallet.", link: "https://nightly.app", rec: false },
                { name: "Google Login", desc: "No wallet needed. Use zkLogin.", link: "/", rec: false },
              ].map((w, i) => (
                <a key={i} href={w.link} target={w.link.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" style={{ textDecoration: "none", background: "#050515", border: w.rec ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", display: "block", position: "relative" }}>
                  {w.rec && <span style={{ position: "absolute", top: "10px", right: "10px", fontSize: "9px", background: "rgba(0,212,255,0.1)", color: "#00d4ff", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(0,212,255,0.2)" }}>Recommended</span>}
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#fff", marginBottom: "6px" }}>{w.name}</div>
                  <div style={{ fontSize: "12px", color: "#8899bb" }}>{w.desc}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === "play" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>OPTCG Tournaments</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>How to Join a Tournament</h2>
            <p style={{ fontSize: "14px", color: "#8899bb", marginBottom: "32px", lineHeight: 1.75 }}>Weekly One Piece TCG tournaments. Entry is 10 SUI. Winners get paid on-chain automatically.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "40px" }}>
              {[{ label: "Entry Fee", val: "10 SUI", icon: "💰" }, { label: "1st Place", val: "40%", icon: "🥇" }, { label: "2nd Place", val: "25%", icon: "🥈" }, { label: "3rd Place", val: "20%", icon: "🥉" }].map((s, i) => (
                <div key={i} style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#00d4ff", marginBottom: "4px" }}>{s.val}</div>
                  <div style={{ fontSize: "10px", color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", color: "#fff", marginBottom: "20px" }}>Download OPTCGSim</h3>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {[{ id: "mac", label: "🍎 Mac" }, { id: "windows", label: "🪟 Windows" }].map(o => (
                <button key={o.id} onClick={() => setOs(o.id)} style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", border: os === o.id ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.1)", background: os === o.id ? "rgba(0,80,255,0.1)" : "transparent", color: os === o.id ? "#00d4ff" : "#8899bb" }}>{o.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {(os === "mac" ? PLAY_STEPS_MAC : PLAY_STEPS_WIN).map((s, i) => <StepCard key={i} s={s} />)}
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://optcgsim.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg, #0055ff, #00d4ff)", color: "#fff", padding: "14px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Download OPTCGSim</a>
              <a href="/optcg" style={{ display: "inline-block", background: "transparent", color: "#c8d8f0", padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "14px", textDecoration: "none" }}>Join Tournament</a>
            </div>
          </div>
        )}

        {tab === "faq" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#00d4ff", marginBottom: "8px" }}>Help</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", color: "#fff", marginBottom: "32px" }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {FAQ.map((faq, i) => (
                <div key={i} style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "transparent", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#ffffff" }}>{faq.q}</span>
                    <span style={{ color: "#00d4ff", fontSize: "18px", flexShrink: 0, marginLeft: "16px" }}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <div style={{ padding: "0 20px 18px", fontSize: "14px", color: "#c8d8f0", lineHeight: 1.75 }}>{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
