export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '120px 48px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: '800px', height: '500px',
          top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
          background: 'radial-gradient(ellipse, rgba(77,162,255,0.06) 0%, rgba(201,168,76,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#4da2ff',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ display: 'block', width: '32px', height: '1px', background: '#4da2ff', opacity: 0.5 }} />
          Web3 TCG Marketplace · Powered by Sui
          <span style={{ display: 'block', width: '32px', height: '1px', background: '#4da2ff', opacity: 0.5 }} />
        </div>

        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(44px, 7vw, 88px)',
          fontWeight: 900, lineHeight: 1.05,
          marginBottom: '28px', position: 'relative', zIndex: 1,
        }}>
          <span style={{ color: '#e6e4f0', display: 'block' }}>Trade Cards.</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, #c9a84c 20%, #e8c97a 60%, #78bfff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Own the Game.</span>
        </h1>

        <p style={{
          maxWidth: '560px', fontSize: '17px', fontWeight: 300,
          color: '#888898', lineHeight: 1.75, marginBottom: '48px',
          position: 'relative', zIndex: 1,
        }}>
          Buy, sell, and list <strong style={{ color: '#e6e4f0', fontWeight: 500 }}>Pokémon, Magic, Yu-Gi-Oh!</strong> and more —
          on-chain with Sui or with your credit card. With an AI Oracle that knows every card in every set.
        </p>

        <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
          <a href="/marketplace" style={{
            background: '#c9a84c', color: '#0a0a0f',
            fontSize: '14px', fontWeight: 500,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '14px 32px', borderRadius: '4px',
            textDecoration: 'none', display: 'inline-block',
          }}>Browse Marketplace</a>
          <a href="/oracle" style={{
            background: 'transparent', color: '#888898',
            fontSize: '14px', padding: '14px 28px', borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.12)',
            textDecoration: 'none', display: 'inline-block',
          }}>Ask AI Oracle ↓</a>
        </div>
      </section>

      {/* STATS */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '36px 48px', display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#111118',
      }}>
        {[
          { num: '120K+', label: 'Cards Listed' },
          { num: '8', label: 'TCG Games' },
          { num: 'Sui', label: 'Blockchain' },
          { num: '1%', label: 'Platform Fee' },
        ].map((stat, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '0 24px',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: '36px',
              fontWeight: 600, color: '#e8c97a',
              letterSpacing: '-0.02em', marginBottom: '6px',
            }}>{stat.num}</div>
            <div style={{
              fontSize: '12px', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#888898',
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* GAMES */}
      <section style={{ padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#4da2ff', marginBottom: '16px',
        }}>Supported Games</div>
        <h2 style={{
          fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 600, color: '#e6e4f0', marginBottom: '48px',
        }}>All your favorite TCGs</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: '⚡', name: 'Pokémon TCG' },
            { icon: '✨', name: 'Magic: The Gathering' },
            { icon: '👁️', name: 'Yu-Gi-Oh!' },
            { icon: '🗡️', name: 'One Piece' },
            { icon: '🐉', name: 'Dragon Ball' },
            { icon: '🌟', name: 'Lorcana' },
            { icon: '⚔️', name: 'Flesh & Blood' },
            { icon: '🎭', name: 'Digimon' },
          ].map((game, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 24px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '60px', background: '#18181f',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: '22px' }}>{game.icon}</span>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '13px',
                fontWeight: 600, color: '#e6e4f0',
              }}>{game.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#4da2ff', marginBottom: '16px',
        }}>Why SuiTCG</div>
        <h2 style={{
          fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 600, color: '#e6e4f0', marginBottom: '48px',
        }}>Built for collectors</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2px', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {[
            { icon: '🃏', title: 'Free Listings', desc: 'List any card for free. We only take 1% when it sells — paid automatically on-chain.' },
            { icon: '⛓️', title: 'On-Chain Trades', desc: 'Every sale is secured by the Sui blockchain. Instant settlement, zero middlemen.' },
            { icon: '🤖', title: 'AI Oracle', desc: 'Ask anything about any TCG card. Prices, rulings, market trends, deck advice.' },
            { icon: '💳', title: 'Web2 + Web3', desc: 'Pay with SUI, USDC, credit card, or GCash. No crypto required to get started.' },
            { icon: '📈', title: 'Price Checker', desc: 'Compare prices across TCGPlayer, CardKingdom, and SuiTCG in one place.' },
            { icon: '🔍', title: 'Smart Search', desc: 'Filter by game, set, rarity, condition, price, and more. Find exactly what you need.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#111118', padding: '40px 36px' }}>
              <div style={{ fontSize: '28px', marginBottom: '20px' }}>{f.icon}</div>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '16px',
                fontWeight: 600, color: '#e6e4f0', marginBottom: '12px',
              }}>{f.title}</div>
              <p style={{ fontSize: '14px', color: '#888898', lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 48px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <h2 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, color: '#e6e4f0', marginBottom: '16px',
        }}>Ready to trade?</h2>
        <p style={{
          fontSize: '16px', color: '#888898',
          marginBottom: '40px', fontWeight: 300,
        }}>Join thousands of collectors on the Sui blockchain.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/marketplace" style={{
            background: '#c9a84c', color: '#0a0a0f',
            padding: '14px 32px', borderRadius: '4px',
            fontSize: '14px', fontWeight: 500,
            textDecoration: 'none', display: 'inline-block',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>Browse Cards</a>
          <a href="/sell" style={{
            background: 'transparent', color: '#888898',
            padding: '14px 28px', borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '14px', textDecoration: 'none',
            display: 'inline-block',
          }}>List a Card</a>
        </div>
      </section>

    </div>
  );
}