"use client";
import { useState } from "react";

const MOCK_PRICES = [
  { card: "Charizard EX", set: "Obsidian Flames", tcgplayer: 285, cardkingdom: 310, suitcg: 295, trend: "up" },
  { card: "Black Lotus", set: "Alpha Edition", tcgplayer: 4100, cardkingdom: 4400, suitcg: 4200, trend: "up" },
  { card: "Blue-Eyes White Dragon", set: "LOB 1st Ed", tcgplayer: 820, cardkingdom: 890, suitcg: 850, trend: "down" },
  { card: "Pikachu Promo", set: "World Championship", tcgplayer: 85, cardkingdom: 95, suitcg: 90, trend: "up" },
  { card: "Mox Sapphire", set: "Beta Edition", tcgplayer: 1800, cardkingdom: 1950, suitcg: 1850, trend: "up" },
  { card: "Mewtwo V Alt Art", set: "Lost Origin", tcgplayer: 115, cardkingdom: 130, suitcg: 120, trend: "down" },
];

export default function PriceChecker() {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);

  const results = MOCK_PRICES.filter(c =>
    c.card.toLowerCase().includes(search.toLowerCase()) ||
    c.set.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '48px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#4da2ff', marginBottom: '12px',
          }}>TCGPlayer · CardKingdom · SuiTCG</div>
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#e6e4f0', marginBottom: '16px',
          }}>Price Checker</h1>
          <p style={{ fontSize: '15px', color: '#888898', fontWeight: 300 }}>
            Compare prices across platforms instantly
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '48px',
        }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setSearched(false); }}
            placeholder="Search any TCG card e.g. Charizard EX..."
            style={{
              flex: 1, background: '#111118',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '14px 20px',
              fontSize: '15px', color: '#e6e4f0',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }}
            onKeyDown={e => e.key === 'Enter' && setSearched(true)}
          />
          <button
            onClick={() => setSearched(true)}
            style={{
              background: '#c9a84c', color: '#0a0a0f',
              border: 'none', borderRadius: '8px',
              padding: '14px 28px', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>Search</button>
        </div>

        {/* Results */}
        {(searched || search.length > 0) && (
          <div>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              gap: '16px', padding: '12px 20px',
              fontSize: '10px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#555562',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '8px',
            }}>
              <div>Card</div>
              <div style={{ textAlign: 'right' }}>TCGPlayer</div>
              <div style={{ textAlign: 'right' }}>CardKingdom</div>
              <div style={{ textAlign: 'right' }}>SuiTCG</div>
              <div style={{ textAlign: 'right' }}>Trend</div>
            </div>

            {results.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px', color: '#555562',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>🔍</div>
                <p>No cards found. Try a different search.</p>
              </div>
            ) : results.map((c, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '16px', padding: '16px 20px',
                background: i % 2 === 0 ? '#111118' : 'transparent',
                borderRadius: '8px', alignItems: 'center',
                marginBottom: '4px',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'Cinzel, serif', fontSize: '13px',
                    fontWeight: 600, color: '#e6e4f0', marginBottom: '2px',
                  }}>{c.card}</div>
                  <div style={{
                    fontSize: '11px', color: '#555562',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{c.set}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '14px', color: '#e6e4f0', fontWeight: 500 }}>
                  ${c.tcgplayer.toLocaleString()}
                </div>
                <div style={{ textAlign: 'right', fontSize: '14px', color: '#e6e4f0', fontWeight: 500 }}>
                  ${c.cardkingdom.toLocaleString()}
                </div>
                <div style={{ textAlign: 'right', fontSize: '14px', color: '#e8c97a', fontWeight: 500 }}>
                  ${c.suitcg.toLocaleString()}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 500,
                    color: c.trend === 'up' ? '#4caf7d' : '#e05555',
                  }}>
                    {c.trend === 'up' ? '↑ Rising' : '↓ Falling'}
                  </span>
                </div>
              </div>
            ))}

            {results.length > 0 && (
              <div style={{
                marginTop: '24px', padding: '16px 20px',
                background: 'rgba(77,162,255,0.05)',
                border: '1px solid rgba(77,162,255,0.15)',
                borderRadius: '8px', fontSize: '12px', color: '#78bfff',
              }}>
                💡 Prices are updated regularly. SuiTCG prices reflect live listings.
                TCGPlayer & CardKingdom prices are for reference.
              </div>
            )}
          </div>
        )}

        {/* Default state */}
        {!searched && search.length === 0 && (
          <div>
            <div style={{
              fontSize: '12px', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#555562', marginBottom: '16px',
            }}>Popular Searches</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Charizard EX', 'Black Lotus', 'Blue-Eyes White Dragon', 'Pikachu Promo', 'Mox Sapphire'].map((s, i) => (
                <button key={i}
                  onClick={() => { setSearch(s); setSearched(true); }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px', background: '#111118',
                    color: '#888898', fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  }}>{s}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}