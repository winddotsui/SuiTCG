import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import NavClient from "./components/NavClient";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "WaveTCG — Web3 TCG Marketplace on Sui",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  description: "Buy, sell and trade One Piece TCG, Pokémon, Magic: The Gathering, Yu-Gi-Oh! and more on Sui blockchain. Free listings, 1% fee, instant on-chain settlement.",
  keywords: ["TCG marketplace", "One Piece TCG", "Pokemon TCG", "Magic The Gathering", "Yu-Gi-Oh", "Sui blockchain", "Web3 trading cards", "NFT cards", "WaveTCG"],
  authors: [{ name: "WaveTCG" }],
  creator: "WaveTCG",
  publisher: "WaveTCG",
  metadataBase: new URL("https://www.wavetcgmarket.com"),
  alternates: {
    canonical: "https://www.wavetcgmarket.com",
  },
  openGraph: {
    title: "WaveTCG — Web3 TCG Marketplace on Sui",
    description: "Buy, sell and trade One Piece TCG, Pokémon, Magic and more on Sui blockchain. Free listings, 1% fee only on sale.",
    url: "https://www.wavetcgmarket.com",
    siteName: "WaveTCG",
    images: [
      {
        url: "https://www.wavetcgmarket.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "WaveTCG — Web3 TCG Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaveTCG — Web3 TCG Marketplace on Sui",
    description: "Buy, sell and trade One Piece TCG, Pokémon, Magic and more on Sui blockchain.",
    images: ["https://www.wavetcgmarket.com/og-image.png"],
    creator: "@wavetcg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=Cinzel:wght@400;600;900&display=swap" rel="stylesheet" />
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
            body { padding-top: 56px; }
          }
          @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .desktop-nav { display: flex !important; }
            body { padding-top: 56px; }
          }
        `}</style>
      </head>
      <body style={{ position: "relative", background: "#000008", margin: 0, padding: 0 }}>
        <Providers>
          <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", height: "56px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(10,10,30,0.95)",
            backdropFilter: "blur(32px)",
          }}>
            <a href="/" style={{
              fontFamily: "Cinzel, serif", fontSize: "20px",
              fontWeight: 900, textDecoration: "none",
              background: "linear-gradient(135deg, #0055ff, #0099ff, #00d4ff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              flexShrink: 0, position: "relative", zIndex: 101, letterSpacing: "0.08em",
            }}>WAVE</a>
            <NavClient />
          </nav>
          <main style={{ paddingTop: "56px", position: "relative", zIndex: 1, minHeight: "100vh", background: "#000008" }}>
            {children}
          </main>
          <Toaster position="bottom-right" toastOptions={{ style: { background: "#0a1628", color: "#ffffff", border: "1px solid rgba(0,153,255,0.2)", fontFamily: "DM Sans, sans-serif", fontSize: "14px" }, success: { iconTheme: { primary: "#00ff88", secondary: "#000008" } }, error: { iconTheme: { primary: "#ff6b6b", secondary: "#000008" } } }} />
</Providers>
      </body>
    </html>
  );
}
