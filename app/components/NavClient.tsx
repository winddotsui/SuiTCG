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
        .nl { color: rgba(255,255,255,0.4); font-size: 13.5px; font-weight: 500; padding: 7px 14px; border-radius: 8px; text-decoration: none; transition: all 0.15s; letter-spacing: 0.01em; }
        .nl:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .more-btn { display: flex; align-items: center; gap: 4px; color: rgba(255,255,255,0.25); font-size: 13.5px; background: none; border: none; cursor: pointer; font-weight: 500; padding: 7px 14px; border-radius: 8px; font-family: inherit; transition: all 0.15s; }
        .more-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
        .more-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #13131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px; min-width: 200px; box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 200; }
        .more-link { display: block; padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,0.55); font-size: 13.5px; text-decoration: none; font-weight: 500; transition: all 0.12s; }
        .more-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .nav-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-decoration: none; font-family: inherit; }
        .nav-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .nav-cta { background: #2563eb; border: none; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; font-family: inherit; transition: all 0.15s; }
        .nav-cta:hover { background: #1d4ed8; }
      `}</style>

      <div className="desktop-nav" style={{ gap: "0", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
        {/* Primary nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nl">{link.label}</a>
          ))}
          {/* More dropdown */}
          <div style={{ position: "relative" }} onMouseEnter={() => setShowMore(true)} onMouseLeave={() => setShowMore(false)}>
            <button className="more-btn">
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <a href="/orders" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }} className="nl">
            Orders
            {(unreadOrders > 0 || unreadMessages > 0) && (
              <span style={{ width: "6px", height: "6px", background: "#ef4444", borderRadius: "50%", flexShrink: 0 }} />
            )}
          </a>
          <a href="/dashboard" className="nl">Dashboard</a>
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)" }} />
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
