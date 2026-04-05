"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface ChatProps {
  listingId: string;
  sellerAddress: string;
  cardName: string;
  onClose: () => void;
}

export default function Chat({ listingId, sellerAddress, cardName, onClose }: ChatProps) {
  const account = useCurrentAccount();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myAddress = account?.address || localStorage.getItem("wavetcg_wallet_address") || "";
  const isSeller = myAddress === sellerAddress;
  const otherAddress = isSeller ? "" : sellerAddress;

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for new messages
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    }, 3000);

    return () => clearInterval(interval);
  }, [listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    // Mark as read
    if (myAddress) {
      await supabase.from("messages")
        .update({ read: true })
        .eq("listing_id", listingId)
        .eq("receiver_address", myAddress);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !myAddress) return;
    setSending(true);

    // Buyer always sends to seller, seller sends to first buyer who messaged
    let receiver = sellerAddress;
    if (isSeller) {
      const buyerMsg = messages.find(m => m.sender_address !== sellerAddress);
      receiver = buyerMsg?.sender_address || otherAddress || "";
    }

    if (!receiver) {
      alert("No buyer to reply to yet.");
      setSending(false);
      return;
    }

    await supabase.from("messages").insert({
      listing_id: listingId,
      sender_address: myAddress,
      receiver_address: receiver,
      message: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div style={{ position: "fixed", bottom: "0px", right: "0px", width: "min(340px, 100vw)", height: "460px", background: "#050515", border: "1px solid rgba(0,153,255,0.3)", borderRadius: "16px", display: "flex", flexDirection: "column", zIndex: 1000, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>💬 {cardName}</div>
          <div style={{ fontSize: "11px", color: "#8899bb" }}>{isSeller ? "Buyer inquiry" : `Seller: ${shortAddr(sellerAddress)}`}</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8899bb", fontSize: "18px", cursor: "pointer", padding: "0 4px" }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {!myAddress ? (
          <div style={{ textAlign: "center", color: "#8899bb", fontSize: "13px", marginTop: "40px" }}>Connect your wallet to chat</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#8899bb", fontSize: "13px", marginTop: "40px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
            Start the conversation!
          </div>
        ) : messages.map(msg => {
          const isMe = msg.sender_address === myAddress;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "75%", background: isMe ? "linear-gradient(135deg, #0055ff, #0099ff)" : "rgba(255,255,255,0.08)", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 12px" }}>
                <div style={{ fontSize: "13px", color: "#fff", lineHeight: 1.4 }}>{msg.message}</div>
              </div>
              <div style={{ fontSize: "10px", color: "#444460", marginTop: "2px" }}>{formatTime(msg.created_at)}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "8px" }}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, background: "#0a1628", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#fff", fontFamily: "DM Sans, sans-serif", outline: "none" }}
        />
        <button onClick={sendMessage} disabled={sending || !newMessage.trim()} style={{ background: "linear-gradient(135deg, #0055ff, #0099ff)", border: "none", borderRadius: "8px", padding: "8px 14px", color: "#fff", fontSize: "16px", cursor: "pointer" }}>
          ➤
        </button>
      </div>
    </div>
  );
}
