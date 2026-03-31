"use client";

export default function CardDetail() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '48px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <a href="/marketplace" style={{
          color: '#888898', fontSize: '13px', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          marginBottom: '32px',
        }}>← Back to Marketplace</a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

          {/* Card Art */}
          <div style={{
            background: '#2a0808', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.12)',
            aspectRatio: '3/4', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '120px',
          }}>🔥</div>

          {/* Info */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#78bfff',
              background: 'rgba(77,162,255,0.1)',
              border: '1px solid rgba(77,162,255,0.2)',
              borderRadius: '4px', padding: '4px 10px',
              display: 'inline-block', marginBottom: '16px',
            }}>⚡ Pokémon TCG</div>

            <h1 style={{
              fontFamily: 'Cinzel, serif', fontSize: '36px',
              fontWeight: 700, color: '#e6e4f0',
              lineHeight: 1.15, marginBottom: '8px',
            }}>Charizard EX</h1>

            <p style={{ fontSize: '13px', color: '#888898', marginBottom: '24px' }}>
              Obsidian Flames #125 · PSA 10
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '36px',
                fontWeight: 600, color: '#e8c97a',
              }}>$295</div>
              <div style={{ fontSize: '14px', color: '#4da2ff' }}>40.5 SUI</div>
            </div>
            <div style={{ fontSize: '12px', color: '#4caf7d', marginBottom: '24px' }}>
              ↑ 12.4% vs last 30 days
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', overflow: 'hidden', marginBottom: '24px',
            }}>
              {[
                { label: 'Condition', val: 'PSA 10' },
                { label: 'Rarity', val: 'Secret Rare' },
                { label: 'Set', val: 'OBF' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#18181f', padding: '12px 14px' }}>
                  <div style={{
                    fontSize: '10px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#555562', marginBottom: '4px',
                  }}>{s.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#e6e4f0' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Seller */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px', background: '#18181f',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', marginBottom: '20px',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 500, color: '#e8c97a',
                fontFamily: 'Cinzel, serif',
              }}>T</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#e6e4f0' }}>TrainerRed</div>
                <div style={{ fontSize: '11px', color: '#888898' }}>312 trades · ★ 4.9</div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                background: '#c9a84c', color: '#0a0a0f',
                border: 'none', borderRadius: '8px', padding: '14px',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Buy Now · $295</button>
              <button style={{
                background: 'rgba(77,162,255,0.1)', color: '#78bfff',
                border: '1px solid rgba(77,162,255,0.3)',
                borderRadius: '8px', padding: '13px',
                fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>◈ Buy with 40.5 SUI</button>
              <button style={{
                background: 'transparent', color: '#888898',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px', padding: '11px',
                fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>Make an Offer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}