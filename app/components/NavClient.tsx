"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });
const ZkLogin = dynamic(() => import("./ZkLogin"), { ssr: false });
const MobileNav = dynamic(() => import("./MobileNav"), { ssr: false });

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell" },
  { href: "/price-checker", label: "Prices" },
  { href: "/oracle", label: "AI Agent" },
];

const MORE_LINKS = [
  { href: "/optcg", label: "☠️ OPTCG Hub" },
  { href: "/deckbuilder", label: "🎴 Deck Builder" },
  { href: "/portfolio", label: "💼 Portfolio" },
  { href: "/swap", label: "💱 Swap" },
  { href: "/alerts", label: "🔔 Alerts" },
  { href: "/users", label: "👥 Collectors" },
  { href: "/analytics", label: "📊 Analytics" },
  { href: "/guide", label: "📖 Guide" },
  { href: "/orders", label: "📦 Orders" },
  { href: "/scan", label: "📷 Card Scanner" },
];

export default function NavClient() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addr = typeof window !== "undefined" ? localStorage.getItem("wavetcg_wallet_address") || "" : "";
    if (!addr) return;
    const fetchUnread = () => {
      supabase.from("messages").select("id", { count: "exact" }).eq("receiver_address", addr).eq("read", false).then(({ count }) => setUnreadMessages(count || 0));
      supabase.from("transactions").select("id", { count: "exact" }).eq("seller_address", addr).eq("read_by_seller", false).then(({ count }) => setUnreadOrders(count || 0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        .nl { color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; padding: 7px 12px; border-radius: 8px; text-decoration: none; transition: all 0.15s; letter-spacing: 0.01em; white-space: nowrap; }
        .nl:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .more-btn { display: flex; align-items: center; gap: 4px; color: rgba(255,255,255,0.45); font-size: 13px; background: none; border: none; cursor: pointer; font-weight: 500; padding: 7px 12px; border-radius: 8px; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .more-btn:hover, .more-btn.active { color: #fff; background: rgba(255,255,255,0.06); }
        .more-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: #0d0d1f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px; min-width: 210px; box-shadow: 0 20px 60px rgba(0,0,0,0.7); z-index: 9999; }
        .more-link { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 13px; text-decoration: none; font-weight: 500; transition: all 0.12s; }
        .more-link:hover { background: rgba(0,153,255,0.08); color: #fff; }
        .nav-cta { background: linear-gradient(135deg,#0055ff,#0099ff); border: none; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div className="desktop-nav" style={{ gap: "0", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nl">{link.label}</a>
          ))}
          {/* More dropdown - click based */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className={`more-btn${showMore ? " active" : ""}`}
              onClick={() => setShowMore(v => !v)}
            >
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {showMore && (
              <div className="more-dropdown">
                {MORE_LINKS.map(link => (
                  <a key={link.href} href={link.href} className="more-link" onClick={() => setShowMore(false)}>{link.label}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <a href="/dashboard" className="nl">Dashboard</a>
          <a href="/orders" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "5px" }} className="nl">
            Orders
            {(unreadOrders > 0 || unreadMessages > 0) && (
              <span style={{ width: "6px", height: "6px", background: "#ef4444", borderRadius: "50%", flexShrink: 0 }} />
            )}
          </a>
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
          <ZkLogin />
          <WalletButton />
          <a href="/sell" className="nav-cta">+ List Card</a>
        </div>
      </div>

      <div className="mobile-menu-btn" style={{ alignItems: "center", gap: "8px" }}>
        <ZkLogin />
        <WalletButton />
        <MobileNav />
      </div>
    </>
  );
}
