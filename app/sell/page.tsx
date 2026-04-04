"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GAMES = ["One Piece TCG", "Pokémon TCG", "Magic: The Gathering", "Yu-Gi-Oh!", "Flesh & Blood", "Digimon", "Lorcana", "Dragon Ball", "Weiss Schwarz", "Union Arena"];
const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];
const CONDITION_LABELS: Record<string, string> = { NM: "Near Mint", LP: "Lightly Played", MP: "Moderately Played", HP: "Heavily Played", DMG: "Damaged" };

export default function Sell() {
  return <div style={{ minHeight: "100vh", background: "#000008", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ color: "#0099ff", fontFamily: "Cinzel, serif", fontSize: "24px" }}>Sell page coming soon</div>
  </div>;
}
