"use client";
import { useState } from "react";

const inputStyle = {
  width: '100%', background: '#18181f',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', padding: '12px 16px',
  fontSize: '14px', color: '#e6e4f0',
  fontFamily: 'DM Sans, sans-serif', outline: 'none',
};

const labelStyle = {
  display: 'block', fontSize: '12px',
  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  color: '#888898', marginBottom: '8px',
};

const btnPrimary = {
  background: '#c9a84c', color: '#0a0a0f',
  border: 'none', borderRadius: '8px', padding: '14px',
  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  letterSpacing: '0.05em', textTransform: 'uppercase' as const,
  width: '100%',
};

const btnSecondary = {
  background: 'transparent', color: '#888898',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', padding: '14px',
  fontSize: '14px', cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif', width: '100%',
};

export default function Sell() {
  const [step, setStep] = useState(1);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '48px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#4da2ff', marginBottom: '12px',
          }}>Free to List · 1% on Sale</div>
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: '36px',
            fontWeight: 700, color: '#e6e4f0',
          }}>List a Card</h1>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {['Card Details', 'Condition & Price', 'Review'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '3px', borderRadius: '2px', marginBottom: '8px',
                background: step > i ? '#c9a84c' : 'rgba(255,255,255,0.1)',
              }} />
              <div style={{
                fontSize: '11px', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: step > i ? '#e8c97a' : '#555562',
              }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '32px',
        }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontFamily: 'Cinzel, serif', fontSize: '20px',
                color: '#e6e4f0', marginBottom: '28px',
              }}>Card Details</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Game</label>
                <select style={inputStyle}>
                  {['Pokémon TCG','Magic: The Gathering','Yu-Gi-Oh!','One Piece','Dragon Ball','Lorcana','Flesh & Blood','Digimon'].map((o,j) => (
                    <option key={j}>{o}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Card Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Charizard EX" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Set / Edition</label>
                <input style={inputStyle} type="text" placeholder="e.g. Obsidian Flames" />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Card Number</label>
                <input style={inputStyle} type="text" placeholder="e.g. 125/197" />
              </div>

              <button style={btnPrimary} onClick={() => setStep(2)}>
                Next Step →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{
                fontFamily: 'Cinzel, serif', fontSize: '20px',
                color: '#e6e4f0', marginBottom: '28px',
              }}>Condition & Price</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Condition</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['PSA 10','PSA 9','PSA 8','Mint','NM','LP','MP','HP'].map((c, i) => (
                    <button key={i} style={{
                      padding: '8px 16px',
                      border: i === 0 ? '1px solid #c9a84c' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px',
                      background: i === 0 ? 'rgba(201,168,76,0.1)' : 'transparent',
                      color: i === 0 ? '#e8c97a' : '#888898',
                      fontSize: '12px', cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Price (USD)</label>
                <input style={inputStyle} type="number" placeholder="0.00" />
                <div style={{ fontSize: '12px', color: '#4da2ff', marginTop: '6px' }}>
                  ≈ 0.00 SUI · Platform fee: 1% on sale
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Description (optional)</label>
                <textarea
                  placeholder="Describe the card condition, any defects, shipping info..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
                <button style={btnPrimary} onClick={() => setStep(3)}>Review Listing →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🃏</div>
              <h2 style={{
                fontFamily: 'Cinzel, serif', fontSize: '24px',
                color: '#e6e4f0', marginBottom: '12px',
              }}>Ready to List!</h2>
              <p style={{
                fontSize: '14px', color: '#888898',
                marginBottom: '32px', lineHeight: 1.75,
              }}>
                Your card will be listed for free. We only take{' '}
                <strong style={{ color: '#e8c97a' }}>1%</strong> when it sells.
              </p>

              <div style={{
                background: '#18181f',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '20px',
                marginBottom: '28px', textAlign: 'left',
              }}>
                {[
                  { label: 'Listing Fee', val: 'Free' },
                  { label: 'Platform Commission', val: '1% on sale' },
                  { label: 'You Receive', val: '99% of sale price' },
                  { label: 'Payment', val: 'SUI or USD' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ fontSize: '13px', color: '#888898' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: '#e8c97a', fontWeight: 500 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={btnSecondary} onClick={() => setStep(2)}>← Back</button>
                <button style={btnPrimary}>🚀 Publish Listing</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}