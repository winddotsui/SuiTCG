"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID || "";

const MOCK_CARDS: Record<string, any> = {
  "m1": { name:"Charizard EX", game:"Pokémon TCG", set_name:"Obsidian Flames", card_number:"125/197", condition:"PSA 10", price_usd:295, price_sui:40.5, art:"🔥", bg:"#2a0808", seller_address:"TrainerRed", description:"Beautiful PSA 10 Charizard EX from Obsidian Flames." },
  "m2": { name:"Black Lotus", game:"Magic: The Gathering", set_name:"Alpha Edition", card_number:"232", condition:"PSA 9", price_usd:4200, price_sui:577, art:"✨", bg:"#14082a", seller_address:"CardVault", description:"Iconic Alpha Black Lotus in PSA 9." },
  "m3": { name:"Blue-Eyes White Dragon", game:"Yu-Gi-Oh!", set_name:"LOB 1st Ed", card_number:"001", condition:"Mint", price_usd:850, price_sui:117, art:"⚡", bg:"#080820", seller_address:"DuelKing", description:"First Edition Blue-Eyes White Dragon." },
  "m4": { name:"Pikachu Promo", game:"Pokémon TCG", set_name:"World Championship", card_number:"001", condition:"NM", price_usd:90, price_sui:12.4, art:"⚡", bg:"#1a1400", seller_address:"PikaCollector", description:"Rare World Championship Pikachu Promo." },
  "m5": { name:"Mox Sapphire", game:"Magic: The Gathering", set_name:"Beta Edition", card_number:"265", condition:"PSA 9", price_usd:1850, price_sui:254, art:"💎", bg:"#040e1c", seller_address:"MoxBroker", description:"Beta Mox Sapphire in PSA 9." },
  "m6": { name:"Mewtwo V Alt Art", game:"Pokémon TCG", set_name:"Lost Origin", card_number:"189/196", condition:"NM", price_usd:120, price_sui:16.5, art:"🌌", bg:"#14082a", seller_address:"MetaTrader", description:"Beautiful alternate art Mewtwo V." },
};

function CardDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [txDigest, setTxDigest] = useState("");
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  async function handleBuy() {
    if (!account) { alert("Connect your Sui wallet first!"); return; }
    if (!card?.listing_object_id) { alert("This listing cannot be purchased on-chain yet."); return; }
    setBuying(true);
    try {
      const priceMist = BigInt(Math.round(card.price_sui * 1_000_000_000));
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [priceMist]);
      tx.moveCall({
        target: `${CONTRACT_ID}::marketplace::buy_listing`,
        arguments: [tx.object(REGISTRY_ID), tx.object(card.listing_object_id), coin],
      });
      const result = await signAndExecute({ transaction: tx });
      setTxDigest(result.digest);
      alert("Purchase successful! TX: " + result.digest);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Transaction failed.");
    }
    setBuying(false);
  }

  useEffect(() => {
    if (!id) return;
    fetchCard(id);
  }, [id]);

  async function fetchCard(cardId: string) {
    if (cardId.startsWith("m")) {
      setCard(MOCK_CARDS[cardId] || null);
      setLoading(false);
      return;
    }
    // Try on-chain listings first
    try {
      const res = await fetch("/api/listings");
      const json = await res.json();
      const chainListing = (json.listings || []).find((l: any) => l.id === cardId);
      if (chainListing) {
        setCard(chainListing);
        setLoading(false);
        return;
      }
    } catch {}
    // Fall back to Supabase
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", cardId)
      .single();
    setCard(data);
    setLoading(false);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#0078ff", fontFamily: "Cinzel, serif", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  if (!card) return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <div style={{ color: "#666680", fontFamily: "Cinzel, serif", marginBottom: "16px" }}>Card not found</div>
        <a href="/marketplace" style={{ color: "#0078ff", fontSize: "13px" }}>← Back to Marketplace</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000000", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        <a href="/marketplace" style={{
          color: "#666680", fontSize: "13px", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "32px",
        }}>← Back to Marketplace</a>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>

          <div style={{
            background: card.bg || "#0a0a18", borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            aspectRatio: "3/4", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "120px", overflow: "hidden",
          }}>
            {card.image_url ? (
              <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (card.art || "🃏")}
          </div>

          <div>
            <div style={{
              fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase",
              color: "#4da8ff", background: "rgba(0,120,255,0.1)",
              border: "1px solid rgba(0,120,255,0.2)", borderRadius: "4px",
              padding: "4px 10px", display: "inline-block", marginBottom: "16px",
            }}>{card.game}</div>

            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "32px", fontWeight: 700, color: "#ffffff", lineHeight: 1.15, marginBottom: "8px" }}>{card.name}</h1>

            <p style={{ fontSize: "13px", color: "#666680", marginBottom: "24px" }}>
              {card.set_name} {card.card_number ? `#${card.card_number}` : ""} · {card.condition}
            </p>

            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "36px", fontWeight: 600, color: "#4da8ff" }}>${card.price_usd?.toLocaleString()}</div>
              <div style={{ fontSize: "14px", color: "#0078ff" }}>{card.price_sui} SUI</div>
            </div>
            <div style={{ fontSize: "12px", color: "#4caf7d", marginBottom: "24px" }}>1% platform fee on purchase</div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px", overflow: "hidden", marginBottom: "24px",
            }}>
              {[
                { label: "Condition", val: card.condition },
                { label: "Game", val: card.game?.split(":")[0] },
                { label: "Set", val: card.set_name?.split(" ").slice(0,2).join(" ") || "—" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#0a0a18", padding: "12px 14px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444460", marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff" }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px", background: "#0a0a18",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px", marginBottom: "20px",
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "rgba(0,120,255,0.1)", border: "1px solid rgba(0,120,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: 500, color: "#4da8ff", fontFamily: "Cinzel, serif",
              }}>{(card.seller_address || "?")[0].toUpperCase()}</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>
                  {card.seller_address?.length > 20 ? `${card.seller_address.slice(0,8)}...${card.seller_address.slice(-6)}` : card.seller_address}
                </div>
                <div style={{ fontSize: "11px", color: "#666680" }}>Verified Seller</div>
              </div>
            </div>

            {card.description && (
              <div style={{ fontSize: "14px", color: "#666680", lineHeight: 1.75, marginBottom: "24px" }}>{card.description}</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button style={{
                background: "linear-gradient(135deg, #0050ff, #0078ff)", color: "#fff",
                border: "none", borderRadius: "8px", padding: "14px",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase",
              }}  onClick={handleBuy} disabled={buying}>{ buying ? "Processing..." : `Buy Now · $${card.price_usd?.toLocaleString()}` }</button>
              <button style={{
                background: "rgba(0,120,255,0.1)", color: "#4da8ff",
                border: "1px solid rgba(0,120,255,0.3)", borderRadius: "8px", padding: "13px",
                fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
              }} onClick={handleBuy} disabled={buying}>◈ Buy with {card.price_sui} SUI</button>
              <button style={{
                background: "transparent", color: "#666680",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "11px",
                fontSize: "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
              }}>Make an Offer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <CardDetailContent params={params} />;
}
