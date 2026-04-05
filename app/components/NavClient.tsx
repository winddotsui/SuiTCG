"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount } from "@mysten/dapp-kit";

const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });
const ZkLogin = dynamic(() => import("./ZkLogin"), { ssr: false });
const MobileNav = dynamic(() => import("./MobileNav"), { ssr: false });

export default function NavClient() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadOrders, setUnreadOrders] = useState(0);

  useEffect(() => {
    const addr = typeof window !== "undefined" ? localStorage.getItem("wavetcg_wallet_address") || "" : "";
    if (!addr) return;

    // Check unread messages
    supabase.from("messages").select("id", { count: "exact" })
      .eq("receiver_address", addr).eq("read", false)
      .then(({ count }) => setUnreadMessages(count || 0));

    // Check unread orders (new sales)
    supabase.from("transactions").select("id", { count: "exact" })
      .eq("seller_address", addr).eq("read_by_seller", false)
      .then(({ count }) => setUnreadOrders(count || 0));

    // Poll every 10 seconds
    const interval = setInterval(() => {
      supabase.from("messages").select("id", { count: "exact" })
        .eq("receiver_address", addr).eq("read", false)
        .then(({ count }) => setUnreadMessages(count || 0));
      supabase.from("transactions").select("id", { count: "exact" })
        .eq("seller_address", addr).eq("read_by_seller", false)
        .then(({ count }) => setUnreadOrders(count || 0));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="desktop-nav" style={{ gap: "16px", alignItems: "center" }}>
        {[
          { href: "/marketplace", label: "Marketplace" },
          { href: "/price-checker", label: "Prices" },
          { href: "/oracle", label: "TCG Agent" },
          { href: "/optcg", label: "🏴‍☠️ OPTCG" },
          { href: "/deckbuilder", label: "🃏 Deck Builder" },
          { href: "/download", label: "Download" },
          { href: "/sell", label: "Sell" },
          { href: "/swap", label: "💱 Swap" },
          { href: "/alerts", label: "🔔 Alerts" },
          
          { href: "/users", label: "👥 Collectors" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5", label: "Profile" },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            fontSize: "11px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#666680",
            textDecoration: "none",
          }}>{link.label}</a>
        ))}
        <a href="/orders" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px", color: "#c8d8f0", fontSize: "13px", textDecoration: "none" }}>
          📦 Orders
          {(unreadOrders > 0 || unreadMessages > 0) && (
            <span style={{ position: "absolute", top: "-4px", right: "-8px", width: "8px", height: "8px", background: "#ff3b3b", borderRadius: "50%" }} />
          )}
        </a>
        <ZkLogin />
        <WalletButton />
      </div>
      <div className="mobile-menu-btn" style={{ alignItems: "center", gap: "8px" }}>
        <ZkLogin />
        <WalletButton />
        <MobileNav />
      </div>
    </>
  );
}


