"use client";
import { useEffect, useState } from "react";

const POKEMON = [
  { name: "Charizard", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", glow: "255,100,0" },
  { name: "Mewtwo", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png", glow: "155,89,182" },
  { name: "Lugia", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png", glow: "77,162,255" },
  { name: "Rayquaza", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png", glow: "0,200,0" },
];

const YUGIOH = [
  { name: "Dark Magician", url: "https://images.ygoprodeck.com/images/cards/46986414.jpg", glow: "100,0,180" },
  { name: "Blue-Eyes", url: "https://images.ygoprodeck.com/images/cards/89631139.jpg", glow: "0,150,255" },
  { name: "Red-Eyes", url: "https://images.ygoprodeck.com/images/cards/74677422.jpg", glow: "180,0,0" },
  { name: "Exodia", url: "https://images.ygoprodeck.com/images/cards/33396948.jpg", glow: "255,180,0" },
];

const POSITIONS = [
  { left: "2vw",  top: "8vh",  size: 200, delay: 0,   duration: 7,   rotate: 12  },
  { left: "20vw", top: "3vh",  size: 185, delay: 0.8, duration: 8,   rotate: -6  },
  { left: "42vw", top: "6vh",  size: 190, delay: 1.5, duration: 6.5, rotate: 8   },
  { left: "65vw", top: "2vh",  size: 188, delay: 0.4, duration: 7.5, rotate: -10 },
  { left: "82vw", top: "7vh",  size: 195, delay: 1.2, duration: 9,   rotate: 6   },
  { left: "0vw",  top: "38vh", size: 210, delay: 0.6, duration: 7,   rotate: -8  },
  { left: "15vw", top: "45vh", size: 195, delay: 1.8, duration: 8.5, rotate: 10  },
  { left: "35vw", top: "40vh", size: 200, delay: 0.2, duration: 6,   rotate: -12 },
  { left: "58vw", top: "43vh", size: 192, delay: 2,   duration: 7.5, rotate: 8   },
  { left: "78vw", top: "38vh", size: 205, delay: 1,   duration: 8,   rotate: -6  },
  { left: "5vw",  top: "72vh", size: 195, delay: 0.9, duration: 7,   rotate: 10  },
  { left: "25vw", top: "78vh", size: 185, delay: 0.3, duration: 8,   rotate: -8  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function FloatingCharacters() {
  const [selected, setSelected] = useState<any[]>([]);
  const [mtgImages, setMtgImages] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMTG();
  }, []);

  useEffect(() => {
    if (mtgImages.length > 0) {
      const mixed = [
        ...shuffle(POKEMON).slice(0, 3),
        ...shuffle(YUGIOH).slice(0, 3),
        ...shuffle(mtgImages).slice(0, 3),
      ];
      setSelected(shuffle(mixed));
    }
  }, [mtgImages]);

  async function fetchMTG() {
    try {
      const searches = [
        "Liliana+of+the+Veil",
        "Jace+the+Mind+Sculptor", 
        "Chandra+Nalaar",
        "Garruk+Wildspeaker",
      ];
      
      const results = await Promise.all(
        searches.map(name => 
          fetch(`https://api.scryfall.com/cards/named?fuzzy=${name}`)
            .then(r => r.json())
            .catch(() => null)
        )
      );

      const mtg = results
        .filter(d => d && d.image_uris?.art_crop)
        .map((d, i) => ({
          name: d.name,
          url: d.image_uris.art_crop,
          glow: ["80,0,120", "0,80,200", "255,80,0", "0,120,0"][i],
        }));

      setMtgImages(mtg);
    } catch (e) {
      console.error(e);
      // Fallback to just Pokemon + Yugioh
      const mixed = [
        ...shuffle(POKEMON).slice(0, 4),
        ...shuffle(YUGIOH).slice(0, 4),
      ];
      setSelected(shuffle(mixed));
    }
  }

  if (!mounted || selected.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes floatChar {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          25% { transform: translateY(-28px) rotate(calc(var(--rot) + 5deg)); }
          75% { transform: translateY(-14px) rotate(calc(var(--rot) - 3deg)); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(var(--glow),0.5)) drop-shadow(0 16px 40px rgba(0,0,0,0.95)); }
          50% { filter: drop-shadow(0 0 45px rgba(var(--glow),0.9)) drop-shadow(0 16px 40px rgba(0,0,0,0.95)); }
        }
        .float-char {
          animation: floatChar var(--dur) ease-in-out infinite var(--del), glowPulse 4s ease-in-out infinite var(--del);
          transition: opacity 0.4s;
        }
        .float-char:hover { opacity: 0.5 !important; }
      `}</style>

      {POSITIONS.slice(0, selected.length).map((pos, i) => {
        const char = selected[i];
        if (!char) return null;
        return (
          <div
            key={`${char.name}-${i}`}
            className="float-char"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: `${pos.size}px`,
              opacity: 0.15,
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
                borderRadius: char.url.includes("ygoprodeck") || char.url.includes("scryfall") ? "10px" : "0",
              }}
              onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"}
            />
          </div>
        );
      })}
    </>
  );
}
