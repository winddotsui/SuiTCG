"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PAGE_CHARACTERS: Record<string, { query: string; game: string; positions: any[] }> = {
  "/": {
    query: "https://api.pokemontcg.io/v2/cards?q=name:charizard&pageSize=1&orderBy=-set.releaseDate",
    game: "pokemon",
    positions: [
      { x: "-30px", y: "120px", size: 90, delay: 0, duration: 6, rotate: 15, side: "left" },
      { x: "-25px", y: "400px", size: 75, delay: 1, duration: 7, rotate: -10, side: "left" },
      { x: "-20px", y: "650px", size: 80, delay: 0.5, duration: 8, rotate: 12, side: "left" },
      { x: "-30px", y: "200px", size: 85, delay: 1.5, duration: 6.5, rotate: -8, side: "right" },
      { x: "-25px", y: "480px", size: 70, delay: 0.8, duration: 7.5, rotate: 10, side: "right" },
      { x: "-20px", y: "720px", size: 75, delay: 2, duration: 8, rotate: -12, side: "right" },
    ],
  },
  "/marketplace": {
    query: "https://api.pokemontcg.io/v2/cards?q=name:pikachu&pageSize=6&orderBy=-set.releaseDate",
    game: "pokemon",
    positions: [
      { x: "-30px", y: "100px", size: 80, delay: 0, duration: 6, rotate: 12, side: "left" },
      { x: "-25px", y: "350px", size: 70, delay: 1.2, duration: 7, rotate: -8, side: "left" },
      { x: "-20px", y: "600px", size: 75, delay: 0.6, duration: 8, rotate: 10, side: "left" },
      { x: "-30px", y: "150px", size: 78, delay: 0.4, duration: 6.5, rotate: -10, side: "right" },
      { x: "-25px", y: "450px", size: 72, delay: 1.8, duration: 7.5, rotate: 8, side: "right" },
      { x: "-20px", y: "700px", size: 70, delay: 1, duration: 8.5, rotate: -12, side: "right" },
    ],
  },
  "/sell": {
    query: "https://api.scryfall.com/cards/named?fuzzy=Liliana+of+the+Veil",
    game: "magic",
    positions: [
      { x: "-30px", y: "120px", size: 90, delay: 0, duration: 7, rotate: 10, side: "left" },
      { x: "-25px", y: "400px", size: 80, delay: 1, duration: 6, rotate: -8, side: "left" },
      { x: "-20px", y: "650px", size: 75, delay: 0.5, duration: 8, rotate: 12, side: "left" },
      { x: "-30px", y: "200px", size: 85, delay: 1.5, duration: 7, rotate: -10, side: "right" },
      { x: "-25px", y: "480px", size: 70, delay: 0.8, duration: 6.5, rotate: 8, side: "right" },
      { x: "-20px", y: "720px", size: 78, delay: 2, duration: 7.5, rotate: -12, side: "right" },
    ],
  },
  "/oracle": {
    query: "https://db.ygoprodeck.com/api/v7/cardinfo.php?name=Dark%20Magician",
    game: "yugioh",
    positions: [
      { x: "-30px", y: "120px", size: 90, delay: 0, duration: 6, rotate: 12, side: "left" },
      { x: "-25px", y: "380px", size: 75, delay: 1, duration: 7, rotate: -8, side: "left" },
      { x: "-30px", y: "180px", size: 85, delay: 0.5, duration: 8, rotate: -10, side: "right" },
      { x: "-25px", y: "500px", size: 70, delay: 1.5, duration: 6.5, rotate: 10, side: "right" },
    ],
  },
};

export default function FloatingCharacters() {
  const [images, setImages] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const config = PAGE_CHARACTERS[pathname] || PAGE_CHARACTERS["/"];

  useEffect(() => {
    setMounted(true);
    fetchImages();
  }, [pathname]);

  async function fetchImages() {
    try {
      let urls: string[] = [];

      if (config.game === "pokemon") {
        const res = await fetch(config.query);
        const data = await res.json();
        if (data.data) {
          urls = data.data.map((c: any) => c.images.small);
        }
      } else if (config.game === "magic") {
        const res = await fetch(config.query);
        const data = await res.json();
        if (data.image_uris) {
          urls = Array(6).fill(data.image_uris.small || data.image_uris.normal);
        }
      } else if (config.game === "yugioh") {
        const res = await fetch(config.query);
        const data = await res.json();
        if (data.data?.[0]) {
          urls = Array(4).fill(data.data[0].card_images[0].image_url_small);
        }
      }

      setImages(urls);
    } catch (e) {
      console.error("Failed to fetch characters:", e);
    }
  }

  if (!mounted || images.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes floatChar {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          33% { transform: translateY(-16px) rotate(calc(var(--rot) + 3deg)); }
          66% { transform: translateY(-8px) rotate(calc(var(--rot) - 2deg)); }
        }
      `}</style>
      {config.positions.map((pos, i) => {
        const imgUrl = images[i % images.length];
        if (!imgUrl) return null;

        return (
          <div
            key={`${pathname}-${i}`}
            style={{
              position: "fixed",
              [pos.side === "left" ? "left" : "right"]: pos.x,
              top: pos.y,
              width: `${pos.size}px`,
              opacity: 0.18,
              animation: `floatChar ${pos.duration}s ease-in-out infinite`,
              animationDelay: `${pos.delay}s`,
              ["--rot" as any]: `${pos.rotate}deg`,
              pointerEvents: "none",
              zIndex: 0,
            }}>
            <img
              src={imgUrl}
              alt={`character-${i}`}
              style={{
                width: "100%",
                borderRadius: "6px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
                display: "block",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
