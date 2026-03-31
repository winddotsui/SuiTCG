import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import NavClient from "./components/NavClient";

export const metadata: Metadata = {
  title: "WaveTCG — TCG Marketplace",
  description: "Buy, sell and trade TCG cards on any blockchain.",
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
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .desktop-nav { display: flex !important; }
          }
        `}</style>
      </head>
      <body>
        <Providers>
          <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", height: "56px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(10,10,15,0.95)",
            backdropFilter: "blur(24px)",
          }}>
            <a href="/" style={{
              fontFamily: "Cinzel, serif", fontSize: "18px",
              fontWeight: 600, textDecoration: "none",
              background: "linear-gradient(135deg, #ffffff, #4da2ff, #00d4ff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", flexShrink: 0,
            }}>WaveTCG</a>
            <NavClient />
          </nav>
          <main style={{ paddingTop: "56px" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

