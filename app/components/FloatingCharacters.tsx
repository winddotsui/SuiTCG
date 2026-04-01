"use client";
import { useEffect, useState } from "react";

const ALL_CHARACTERS = [
  // One Piece - Official card art
  { name: "Monkey D. Luffy", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-003.png", glow: "255,50,50" },
  { name: "Roronoa Zoro", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png", glow: "0,200,80" },
  { name: "Shanks", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP06-001.png", glow: "255,30,30" },
  { name: "Gol D. Roger", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP08-001.png", glow: "255,180,0" },
  { name: "Edward Newgate", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP02-001.png", glow: "255,220,0" },
  { name: "Kaido", url: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-061.png", glow: "120,0,220" },
  // Pokemon - HD official artwork
  { name: "Charizard", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", glow: "255,100,0" },
  { name: "Mewtwo", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png", glow: "155,89,182" },
  { name: "Lugia", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png", glow: "77,162,255" },
  { name: "Rayquaza", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png", glow: "0,200,0" },
  { name: "Umbreon", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png", glow: "255,220,0" },
  { name: "Gengar", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png", glow: "100,0,180" },
  // Yu-Gi-Oh - HD card images
  { name: "Dark Magician", url: "https://images.ygoprodeck.com/images/cards/46986414.jpg", glow: "100,0,180" },
  { name: "Blue-Eyes White Dragon", url: "https://images.ygoprodeck.com/images/cards/89631139.jpg", glow: "0,150,255" },
  { name: "Red-Eyes Black Dragon", url: "https://images.ygoprodeck.com/images/cards/74677422.jpg", glow: "180,0,0" },
  { name: "Exodia", url: "https://images.ygoprodeck.com/images/cards/33396948.jpg", glow: "255,180,0" },
  { name: "Slifer the Sky Dragon", url: "https://images.ygoprodeck.com/images/cards/83764718.jpg", glow: "255,50,50" },
  { name: "Obelisk the Tormentor", url: "https://images.ygoprodeck.com/images/cards/10000010.jpg", glow: "0,50,200" },
  // Magic the Gathering - Scryfall HD art
  { name: "Black Lotus", url: "https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg", glow: "50,50,50" },
  { name: "Liliana of the Veil", url: "https://cards.scryfall.io/art_crop/front/1/f/1f0d2e8e-c8f2-4b31-a6ba-6283fc8399d7.jpg", glow: "80,0,120" },
  { name: "Jace the Mind Sculptor", url: "https://cards.scryfall.io/art_crop/front/a/d/ad29b0d0-9f0d-4a4e-9ee2-bca72c394f50.jpg", glow: "0,80,200" },
  { name: "Chandra Nalaar", url: "https://cards.scryfall.io/art_crop/front/5/5/55a5e4e8-7511-4432-8c4e-dbb3e7d6a395.jpg", glow: "255,80,0" },
  { name: "Garruk Wildspeaker", url: "https://cards.scryfall.io/art_crop/front/d/c/dc4d3a22-1d0a-46ba-a879-f7a1818b59ac.jpg", glow: "0,120,0" },
  { name: "Nicol Bolas", url: "https://cards.scryfall.io/art_crop/front/9/a/9a4c4528-9b36-4670-b3a1-b54cdfab5267.jpg", glow: "100,0,100" },
];

const POSITIONS = [
  { left: "1vw",  top: "5vh",  size: 170, delay: 0,   duration: 7,   rotate: 10  },
  { left: "18vw", top: "2vh",  size: 155, delay: 0.8, duration: 8,   rotate: -6  },
  { left: "38vw", top: "4vh",  size: 160, delay: 1.5, duration: 6.5, rotate: 8   },
  { left: "60vw", top: "1vh",  size: 158, delay: 0.4, duration: 7.5, rotate: -10 },
  { left: "80vw", top: "6vh",  size: 165, delay: 1.2, duration: 9,   rotate: 6   },
  { left: "92vw", top: "2vh",  size: 152, delay: 0.6, duration: 7,   rotate: -8  },
  { left: "0vw",  top: "35vh", size: 175, delay: 1.8, duration: 8.5, rotate: 10  },
  { left: "14vw", top: "42vh", size: 160, delay: 0.2, duration: 6,   rotate: -12 },
  { left: "55vw", top: "38vh", size: 162, delay: 2,   duration: 7.5, rotate: 8   },
  { left: "76vw", top: "35vh", size: 168, delay: 1,   duration: 8,   rotate: -6  },
  { left: "90vw", top: "40vh", size: 155, delay: 0.5, duration: 7,   rotate: 10  },
  { left: "4vw",  top: "70vh", size: 162, delay: 0.9, duration: 7,   rotate: -8  },
  { left: "22vw", top: "75vh", size: 155, delay: 0.3, duration: 8,   rotate: 6   },
  { left: "45vw", top: "72vh", size: 158, delay: 1.4, duration: 7,   rotate: -10 },
  { left: "68vw", top: "70vh", size: 165, delay: 0.7, duration: 8.5, rotate: 8   },
  { left: "86vw", top: "75vh", size: 152, delay: 1.6, duration: 7,   rotate: -6  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function FloatingCharacters() {
  const [selected, setSelected] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pick exactly 1 from each game, no repeats, then fill rest randomly
    const onepiece = shuffle(ALL_CHARACTERS.slice(0, 6));
    const pokemon = shuffle(ALL_CHARACTERS.slice(6, 12));
    const yugioh = shuffle(ALL_CHARACTERS.slice(12, 18));
    const mtg = shuffle(ALL_CHARACTERS.slice(18, 24));
    
    // Interleave them so they appear assorted
    const mixed: any[] = [];
    for (let i = 0; i < 6; i++) {
      if (onepiece[i]) mixed.push(onepiece[i]);
      if (pokemon[i]) mixed.push(pokemon[i]);
      if (yugioh[i]) mixed.push(yugioh[i]);
      if (mtg[i]) mixed.push(mtg[i]);
    }
    setSelected(shuffle(mixed).slice(0, 16));
  }, []);

  if (!mounted || selected.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes floatChar {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          25% { transform: translateY(-30px) rotate(calc(var(--rot) + 4deg)); }
          75% { transform: translateY(-15px) rotate(calc(var(--rot) - 3deg)); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(var(--glow),0.4)) drop-shadow(0 16px 40px rgba(0,0,0,0.95)); }
          50% { filter: drop-shadow(0 0 40px rgba(var(--glow),0.85)) drop-shadow(0 16px 40px rgba(0,0,0,0.95)); }
        }
        .float-char {
          animation: floatChar var(--dur) ease-in-out infinite var(--del), glowPulse 4s ease-in-out infinite var(--del);
          transition: opacity 0.4s;
        }
        .float-char:hover { opacity: 0.6 !important; }
      `}</style>

      {POSITIONS.slice(0, selected.length).map((pos, i) => {
        const char = selected[i];
        if (!char) return null;
        const isCard = char.url.includes("ygoprodeck") || char.url.includes("onepiece-cardgame");
        return (
          <div
            key={`${char.name}-${i}`}
            className="float-char"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: `${pos.size}px`,
              opacity: 0.13,
              ["--rot" as any]: `${pos.rotate}deg`,
              ["--dur" as any]: `${pos.duration}s`,
              ["--del" as any]: `${pos.delay}s`,
              ["--glow" as any]: char.glow,
              pointerEvents: "none",
              zIndex: 0,
            }}>
            <img
              src={char.url}
              alt={char.name}
              style={{
                width: "100%",
                display: "block",
                borderRadius: isCard ? "8px" : "0",
              }}
              onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"}
            />
          </div>
        );
      })}
    </>
  );
}
