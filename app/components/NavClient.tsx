"use client";
import dynamic from "next/dynamic";

const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });
const ZkLogin = dynamic(() => import("./ZkLogin"), { ssr: false });
const MobileNav = dynamic(() => import("./MobileNav"), { ssr: false });

export default function NavClient() {
  return (
    <>
      <div className="desktop-nav" style={{ gap: "16px", alignItems: "center" }}>
        {[
          { href: "/marketplace", label: "Marketplace" },
          { href: "/price-checker", label: "Prices" },
          { href: "/oracle", label: "AI Oracle" },
          { href: "/optcg", label: "🏴u200d☠️ OPTCG" },
          { href: "/deckbuilder", label: "🃏 Deck Builder" },
          { href: "/download", label: "Download" },
          { href: "/sell", label: "Sell" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/profile/0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5", label: "Profile" },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            fontSize: "11px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#888898",
            textDecoration: "none",
          }}>{link.label}</a>
        ))}
        <ZkLogin />
        <WalletButton />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div className="mobile-menu-btn" style={{ display: "none" }}>
          <ZkLogin />
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </>
  );
}
