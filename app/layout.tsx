import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuiTCG — TCG Marketplace on Sui",
  description: "Buy, sell and trade TCG cards on the Sui blockchain. Pokémon, Magic, Yu-Gi-Oh! and more.",
  openGraph: {
    title: "SuiTCG Marketplace",
    description: "The premier TCG marketplace on Sui blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(24px)',
        }}>
          <a href="/" style={{
            fontFamily: 'Cinzel, serif', fontSize: '20px',
            fontWeight: 600, textDecoration: 'none',
            background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SuiTCG
          </a>
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/price-checker', label: 'Price Checker' },
              { href: '/oracle', label: 'AI Oracle' },
              { href: '/sell', label: 'Sell' },
              { href: '/dashboard', label: 'Dashboard' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                fontSize: '12px', letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#888898',
                textDecoration: 'none',
              }}>
                {link.label}
              </a>
            ))}
            <button style={{
              background: '#c9a84c', color: '#0a0a0f',
              border: 'none', borderRadius: '6px',
              padding: '8px 18px', fontSize: '12px',
              fontWeight: 500, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Connect Wallet
            </button>
          </div>
        </nav>
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}