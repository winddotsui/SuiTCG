"use client";

export default function Marketplace() {
  const cards = [
    { id:1, name:"Charizard EX", set:"Obsidian Flames", game:"Pokémon", price:295, sui:40.5, cond:"PSA 10", art:"🔥", bg:"#2a0808" },
    { id:2, name:"Black Lotus", set:"Alpha Edition", game:"Magic", price:4200, sui:577, cond:"PSA 9", art:"✨", bg:"#14082a" },
    { id:3, name:"Blue-Eyes White Dragon", set:"LOB 1st Ed", game:"Yu-Gi-Oh!", price:850, sui:117, cond:"Mint", art:"⚡", bg:"#080820" },
    { id:4, name:"Pikachu Promo", set:"World Championship", game:"Pokémon", price:90, sui:12.4, cond:"NM", art:"⚡", bg:"#1a1400" },
    { id:5, name:"Mox Sapphire", set:"Beta Edition", game:"Magic", price:1850, sui:254, cond:"PSA 9", art:"💎", bg:"#040e1c" },
    { id:6, name:"Mewtwo V Alt Art", set:"Lost Origin", game:"Pokémon", price:120, sui:16.5, cond:"NM", art:"🌌", bg:"#14082a" },
    { id:7, name:"Dark Magician Ghost", set:"Duelist Pack", game:"Yu-Gi-Oh!", price:340, sui:46.7, cond:"PSA 10", art:"🔮", bg:"#080808" },
    { id:8, name:"Ancestral Recall", set:"Alpha Edition", game:"Magic", price:3200, sui:439, cond:"LP", art:"📜", bg:"#040e1c" },
    { id:9, name:"Rayquaza VMAX", set:"Evolving Skies", game:"Pokémon", price:220, sui:30.2, cond:"PSA 10", art:"🐉", bg:"#0a1408" },
    { id:10, name:"Exodia Complete Set", set:"LOB 1st Ed", game:"Yu-Gi-Oh!", price:3500, sui:481, cond:"PSA 9", art:"👁️", bg:"#080808" },
    { id:11, name:"Umbreon VMAX Alt Art", set:"Evolving Skies", game:"Pokémon", price:480, sui:66, cond:"NM", art:"🌙", bg:"#080808" },
    { id:12, name:"Time Walk", set:"Alpha Edition", game:"Magic", price:2800, sui:385, cond:"MP", art:"⏳", bg:"#040e1c" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '256px', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        padding: '28px 20px', background: '#111118',
        position: 'sticky', top: '60px',
        height: 'calc(100vh - 60px)', overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#555562', marginBottom: '12px',
          }}>Game</div>
          {['All Games', 'Pokémon', 'Magic: TG', 'Yu-Gi-Oh!', 'One Piece', 'Others'].map((g, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', width: '100%', textAlign: 'left',
              background: i === 0 ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: i === 0 ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              borderRadius: '8px', color: i === 0 ? '#e8c97a' : '#888898',
              fontSize: '13px', cursor: 'pointer', marginBottom: '4px',
              fontFamily: 'DM Sans, sans-serif',
            }}>{g}</button>
          ))}
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#555562', marginBottom: '12px',
          }}>Price Range (USD)</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input placeholder="Min" style={{
              flex: 1, background: '#18181f',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', padding: '8px 10px',
              fontSize: '13px', color: '#e6e4f0',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }} />
            <input placeholder="Max" style={{
              flex: 1, background: '#18181f',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', padding: '8px 10px',
              fontSize: '13px', color: '#e6e4f0',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#555562', marginBottom: '12px',
          }}>Condition</div>
          {['PSA 10', 'PSA 9', 'Mint', 'NM', 'LP', 'MP'].map((c, i) => (
            <button key={i} style={{
              padding: '6px 12px', margin: '3px',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px', background: 'transparent',
              color: '#888898', fontSize: '11px',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>{c}</button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <input
            placeholder="🔍  Search cards, sets, games..."
            style={{
              flex: 1, background: '#111118',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '11px 16px',
              fontSize: '14px', color: '#e6e4f0',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }}
          />
          <select style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px', padding: '11px 16px',
            fontSize: '13px', color: '#e6e4f0',
            fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer',
          }}>
            <option>Most Popular</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#888898', marginBottom: '20px' }}>
          <strong style={{ color: '#e6e4f0' }}>{cards.length}</strong> cards available
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {cards.map(card => (
            <a key={card.id} href={`/card/${card.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <div style={{
                  width: '100%', aspectRatio: '3/2',
                  background: card.bg,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '52px',
                }}>{card.art}</div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{
                    fontFamily: 'Cinzel, serif', fontSize: '12.5px',
                    fontWeight: 600, color: '#e6e4f0', marginBottom: '3px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{card.name}</div>
                  <div style={{
                    fontSize: '11px', color: '#555562',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px',
                  }}>{card.game} · {card.cond}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#e8c97a' }}>${card.price.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#4da2ff' }}>{card.sui} SUI</div>
                    </div>
                    <button style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px', padding: '6px 12px',
                      fontSize: '11px', color: '#888898',
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>Buy</button>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}