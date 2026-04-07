"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
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
  { href: "/optcg", label: "🏴‍☠️ OPTCG Hub" },
  { href: "/deckbuilder", label: "Deck Builder" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/swap", label: "Swap" },
  { href: "/alerts", label: "Alerts" },
  { href: "/users", label: "Collectors" },
  { href: "/analytics", label: "Analytics" },
  { href: "/guide", label: "Guide" },
];

export default function NavClient() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <>
      <style>{`
        .nav-link { color: #6b7280; font-size: 14px; text-decoration: none; font-weight: 500; transition: color 0.15s; padding: 6px 0; }
        .nav-link:hover { color: #111827; }
        .nav-cta { background: #111827; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .nav-cta:hover { background: #1f2937; }
        .more-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px; min-width: 200px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); z-index: 200; }
        .more-link { display: block; padding: 8px 12px; border-radius: 8px; color: #374151; font-size: 14px; text-decoration: none; font-weight: 500; transition: background 0.1s; }
        .more-link:hover { background: #f3f4f6; color: #111827; }
        .more-btn { display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 14px; background: none; border: none; cursor: pointer; font-weight: 500; padding: 6px 0; transition: color 0.15s; }
        .more-btn:hover { color: #111827; }
      `}</style>
      <div className="desktop-nav" style={{ gap: "0", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
        {/* Primary nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
          ))}
          {/* More dropdown */}
          <div style={{ position: "relative" }} onMouseEnter={() => setShowMore(true)} onMouseLeave={() => setShowMore(false)}>
            <button className="more-btn">
              More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {showMore && (
              <div className="more-dropdown">
                {MORE_LINKS.map(link => (
                  <a key={link.href} href={link.href} className="more-link">{link.label}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/orders" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px", textDecoration: "none", fontWeight: 500, padding: "6px 0" }} className="nav-link">
            Orders
            {(unreadOrders > 0 || unreadMessages > 0) && (
              <span style={{ width: "7px", height: "7px", background: "#ef4444", borderRadius: "50%", flexShrink: 0 }} />
            )}
          </a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }} />
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
