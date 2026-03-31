"use client";
import { useEffect, useState } from "react";

interface CardImage {
  name: string;
  game: string;
  imageUrl: string;
  price: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  rotate: number;
}

export default function Home() {
  const [cards, setCards] = useState<CardImage[]>([]);
  const [heroCards, setHeroCards] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCardImages();
  }, []);

  async function fetchCardImages() {
    try {
      const [pokemonRes, magicRes, yugiohRes] = await Promise.all([
        fetch("https://api.pokemontcg.io/v2/cards?q=name:charizard&pageSize=3&orderBy=-set.releaseDate"),
        fetch("https://api.scryfall.com/cards/named?fuzzy=Black+Lotus"),
        fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?name=Blue-Eyes%20White%20Dragon"),
      ]);

      const pokemonData = await pokemonRes.json();
      const magicData = await magicRes.json();
      const yugiohData = await yugiohRes.json();

      const positions = [
        { x: "2%", y: "20%", size: 130, delay: 0, rotate: -8 },
        { x: "80%", y: "15%", size: 120, delay: 0.5, rotate: 6 },
        { x: "88%", y: "55%", size: 115, delay: 1, rotate: -4 },
        { x: "0%", y: "60%", size: 120, delay: 1.5, rotate: 5 },
        { x: "75%", y: "78%", size: 110, delay: 0.8, rotate: -6 },
        { x: "5%", y: "82%", size: 115, delay: 1.2, rotate: 4 },
      ];

      const allCards: CardImage[] = [];

      if (pokemonData.data?.[0]) {
        allCards.push({
          name: pokemonData.data[0].name,
          game: "Pokémon TCG",
          imageUrl: pokemonData.data[0].images.large,
          price: `$${Math.floor(Math.random() * 300 + 50)}`,
          ...positions[0],
        });
      }
      if (pokemonData.data?.[1]) {
        allCards.push({
          name: pokemonData.data[1].name,
          game: "Pokémon TCG",
          imageUrl: pokemonData.data[1].images.large,
          price: `$${Math.floor(Math.random() * 200 + 30)}`,
          ...positions[4],
        });
      }
      if (magicData.image_uris?.normal) {
        allCards.push({
          name: magicData.name,
          game: "Magic: TG",
          imageUrl: magicData.image_uris.normal,
          price: "$4,200",
          ...positions[1],
        });
      }
      if (yugiohData.data?.[0]) {
        allCards.push({
          name: yugiohData.data[0].name,
          game: "Yu-Gi-Oh!",
          imageUrl: yugiohData.data[0].card_images[0].image_url,
          price: "$850",
          ...positions[2],
        });
      }

      setCards(allCards);

      // Hero featured cards
      const featured = [];
      if (pokemonData.data?.[0]) featured.push({ ...pokemonData.data[0], game: "Pokémon TCG", price: 295, priceDisplay: "$295" });
      if (magicData.image_uris) featured.push({ name: "Black Lotus", images: { large: magicData.image_uris.normal }, game: "Magic: TG", price: 4200, priceDisplay: "$4,200" });
      if (yugiohData.data?.[0]) featured.push({ name: yugiohData.data[0].name, images: { large: yugiohData.data[0].card_images[0].image_url }, game: "Yu-Gi-Oh!", price: 850, priceDisplay: "$850" });
      if (pokemonData.data?.[2]) featured.push({ ...pokemonData.data[2], game: "Pokémon TCG", price: 120, priceDisplay: "$120" });

      setHeroCards(featured);
    } catch (e) {
      console.error("Failed to fetch card images:", e);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", overflow: "hidden" }}>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
          50% { transform: translateY(-18px) rotate(calc(var(--rotate) * -0.5)); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.12; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-float {
          animation: floatCard 6s ease-in-out infinite;
        }
        .card-float:hover {
          opacity: 1 !important;
          transform: scale(1.05) !important;
          z-index: 50 !important;
        }
      `}</style>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex",
        flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "120px 48px 80px", position: "relative",
      }}>

        {/* Background glows */}
        <div style={{ position: "absolute", width: "600px", height: "600px", top: "20%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(77,162,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", top: "10%", left: "15%", background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", top: "10%", right: "15%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite 2s" }} />

        {/* Floating card images */}
        {mounted && cards.map((card, i) => (
          <div key={i}
            className="card-float"
            style={{
              position: "absolute",
              left: card.x, top: card.y,
              width: `${card.size}px`,
              opacity: 0.25,
              animationDelay: `${card.delay}s`,
              animationDuration: `${5 + i * 0.7}s`,
              ["--rotate" as any]: `${card.rotate}deg`,
              transition: "opacity 0.3s, transform 0.3s",
              pointerEvents: "none",
              zIndex: 1,
            }}>
            <img
              src={card.imageUrl}
              alt={card.name}
              style={{
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                display: "block",
              }}
            />
          </div>
        ))}

        {/* Main hero content */}
        <div style={{ position: "relative", zIndex: 10, animation: "slideUp 0.8s ease both" }}>
          <div style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#4da2ff",
            marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px",
            justifyContent: "center",
          }}>
            <span style={{ display: "block", width: "32px", height: "1px", background: "#4da2ff", opacity: 0.5 }} />
            Web3 TCG Marketplace · Multi-Chain
            <span style={{ display: "block", width: "32px", height: "1px", background: "#4da2ff", opacity: 0.5 }} />
          </div>

          <h1 style={{
            fontFamily: "Cinzel, serif",
            fontSize: "clamp(44px, 7vw, 88px)",
            fontWeight: 900, lineHeight: 1.05, marginBottom: "28px",
          }}>
            <span style={{ color: "#e6e4f0", display: "block" }}>Ride the Wave.</span>
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #1a8fe3 0%, #4da2ff 40%, #00d4ff 70%, #c9a84c 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Trade Any Card.</span>
          </h1>

          <p style={{
            maxWidth: "520px", fontSize: "17px", fontWeight: 300,
            color: "#888898", lineHeight: 1.75, marginBottom: "48px", margin: "0 auto 48px",
          }}>
            Buy, sell, and list <strong style={{ color: "#e6e4f0", fontWeight: 500 }}>Pokémon, Magic, Yu-Gi-Oh!, One Piece</strong> and more —
            on any chain. With an AI Oracle that knows every card in every set.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/marketplace" style={{
              background: "linear-gradient(135deg, #1a8fe3, #4da2ff)", color: "#fff",
              fontSize: "14px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase",
              padding: "14px 32px", borderRadius: "4px", textDecoration: "none", display: "inline-block",
              boxShadow: "0 4px 24px rgba(77,162,255,0.3)",
            }}>Browse Marketplace</a>
            <a href="/oracle" style={{
              background: "transparent", color: "#888898", fontSize: "14px",
              padding: "14px 28px", borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none", display: "inline-block",
            }}>Ask AI Oracle ↓</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "36px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#111118",
      }}>
        {[
          { num: "120K+", label: "Cards Listed" },
          { num: "8", label: "TCG Games" },
          { num: "Multi", label: "Chain Support" },
          { num: "1%", label: "Platform Fee" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center", padding: "0 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "32px", fontWeight: 600, color: "#4da2ff", letterSpacing: "-0.02em", marginBottom: "6px" }}>{stat.num}</div>
            <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888898" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURED CARDS */}
      <section style={{ padding: "80px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "16px" }}>Featured Cards</div>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#e6e4f0", marginBottom: "48px" }}>Trade legends, own history</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {heroCards.length > 0 ? heroCards.map((card, i) => (
            <a key={i} href="/marketplace" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#111118", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px", overflow: "hidden", cursor: "pointer",
                transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(77,162,255,0.3)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#18181f" }}>
                  <img src={card.images?.large} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: "13px", fontWeight: 600, color: "#e6e4f0", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                  <div style={{ fontSize: "11px", color: "#888898", marginBottom: "10px" }}>{card.game}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "#4da2ff" }}>{card.priceDisplay}</div>
                    <div style={{ fontSize: "10px", color: "#555562", padding: "3px 8px", background: "rgba(77,162,255,0.08)", borderRadius: "4px" }}>Buy</div>
                  </div>
                </div>
              </div>
            </a>
          )) : (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                background: "#111118", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px", overflow: "hidden",
              }}>
                <div style={{ width: "100%", aspectRatio: "3/4", background: "linear-gradient(90deg, #18181f 25%, #222230 50%, #18181f 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: "14px" }}>
                  <div style={{ height: "14px", background: "#18181f", borderRadius: "4px", marginBottom: "8px" }} />
                  <div style={{ height: "10px", background: "#18181f", borderRadius: "4px", width: "60%" }} />
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="/marketplace" style={{
            display: "inline-block", padding: "12px 32px",
            border: "1px solid rgba(77,162,255,0.3)", borderRadius: "6px",
            color: "#4da2ff", fontSize: "13px", textDecoration: "none",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>View All Cards →</a>
        </div>
      </section>

      {/* GAMES */}
      <section style={{ padding: "80px 48px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "16px" }}>Supported Games</div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#e6e4f0", marginBottom: "48px" }}>All your favorite TCGs</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { icon: "⚡", name: "Pokémon TCG" },
              { icon: "✨", name: "Magic: The Gathering" },
              { icon: "👁️", name: "Yu-Gi-Oh!" },
              { icon: "🗡️", name: "One Piece" },
              { icon: "🐉", name: "Dragon Ball" },
              { icon: "🌟", name: "Lorcana" },
              { icon: "⚔️", name: "Flesh & Blood" },
              { icon: "🎭", name: "Digimon" },
            ].map((game, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px 24px", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "60px", background: "#18181f", cursor: "pointer",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(77,162,255,0.3)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)"}
              >
                <span style={{ fontSize: "22px" }}>{game.icon}</span>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: "13px", fontWeight: 600, color: "#e6e4f0" }}>{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "16px" }}>Why WaveTCG</div>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#e6e4f0", marginBottom: "48px" }}>Built for collectors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
          {[
            { icon: "🃏", title: "Free Listings", desc: "List any card for free. We only take 1% when it sells — paid automatically on-chain." },
            { icon: "⛓️", title: "Multi-Chain", desc: "Trade on Sui, Ethereum, Solana and more. Use any wallet you already have." },
            { icon: "🤖", title: "AI Oracle", desc: "Ask anything about any TCG card. Prices, rulings, market trends, deck advice." },
            { icon: "💳", title: "Web2 + Web3", desc: "Pay with crypto, credit card, or GCash. No crypto required to get started." },
            { icon: "📈", title: "Price Checker", desc: "Compare prices across TCGPlayer, CardKingdom, and WaveTCG in one place." },
            { icon: "🔍", title: "Smart Search", desc: "Filter by game, set, rarity, condition, price, and more." },
          ].map((f, i) => (
            <div key={i} style={{ background: "#111118", padding: "40px 36px", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#18181f"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#111118"}
            >
              <div style={{ fontSize: "32px", marginBottom: "20px" }}>{f.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#e6e4f0", marginBottom: "12px" }}>{f.title}</div>
              <p style={{ fontSize: "14px", color: "#888898", lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(77,162,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#e6e4f0", marginBottom: "16px" }}>Ready to ride the wave?</h2>
        <p style={{ fontSize: "16px", color: "#888898", marginBottom: "40px", fontWeight: 300 }}>Join thousands of collectors on WaveTCG.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/marketplace" style={{ background: "linear-gradient(135deg, #1a8fe3, #4da2ff)", color: "#fff", padding: "14px 32px", borderRadius: "4px", fontSize: "14px", fontWeight: 500, textDecoration: "none", display: "inline-block", letterSpacing: "0.05em", textTransform: "uppercase", boxShadow: "0 4px 24px rgba(77,162,255,0.3)" }}>Browse Cards</a>
          <a href="/sell" style={{ background: "transparent", color: "#888898", padding: "14px 28px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.12)", fontSize: "14px", textDecoration: "none", display: "inline-block" }}>List a Card</a>
        </div>
      </section>

    </div>
  );
}
