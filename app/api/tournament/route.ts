import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

const TOURNAMENT_ID = process.env.NEXT_PUBLIC_TOURNAMENT_ID || "";

export async function POST(request: Request) {
  const { action, data } = await request.json();

  if (action === "start") {
    // Get all registered players
    const { data: players } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("tournament_id", "weekly-18")
      .eq("status", "registered");

    if (!players || players.length < 2) {
      return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 });
    }

    // Generate Round 1 Swiss pairings
    const { Swiss } = await import("tournament-pairings");
    const swissPlayers = players.map((p: any) => ({
      id: p.wallet_address,
      score: 0,
    }));

    const matches = Swiss(swissPlayers, 1);

    // Save matches to Supabase
    const matchRows = matches.map((m: any) => ({
      tournament_id: "weekly-18",
      round: 1,
      player1_wallet: m.player1,
      player2_wallet: m.player2 || null,
      status: m.player2 ? "pending" : "bye",
      winner_wallet: m.player2 ? null : m.player1,
    }));

    await supabase.from("tournament_matches").insert(matchRows);

    // Update tournament state
    await supabase.from("tournament_state").upsert({
      tournament_id: "weekly-18",
      current_round: 1,
      status: "active",
      total_rounds: Math.ceil(Math.log2(players.length)),
    }, { onConflict: "tournament_id" });

    return NextResponse.json({ success: true, round: 1, matches: matchRows });
  }

  if (action === "next_round") {
    // Get current state
    const { data: state } = await supabase
      .from("tournament_state")
      .select("*")
      .eq("tournament_id", "weekly-18")
      .single();

    if (!state) return NextResponse.json({ error: "No active tournament" }, { status: 400 });

    const nextRound = state.current_round + 1;

    // Get all matches so far to calculate standings
    const { data: allMatches } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", "weekly-18")
      .not("winner_wallet", "is", null);

    // Calculate scores
    const scores: Record<string, number> = {};
    (allMatches || []).forEach((m: any) => {
      if (m.winner_wallet) {
        scores[m.winner_wallet] = (scores[m.winner_wallet] || 0) + 1;
      }
    });

    // Get all players
    const { data: players } = await supabase
      .from("tournament_registrations")
      .select("wallet_address")
      .eq("tournament_id", "weekly-18");

    const { Swiss } = await import("tournament-pairings");
    const swissPlayers = (players || []).map((p: any) => ({
      id: p.wallet_address,
      score: scores[p.wallet_address] || 0,
    }));

    const matches = Swiss(swissPlayers, nextRound);
    const matchRows = matches.map((m: any) => ({
      tournament_id: "weekly-18",
      round: nextRound,
      player1_wallet: m.player1,
      player2_wallet: m.player2 || null,
      status: m.player2 ? "pending" : "bye",
      winner_wallet: m.player2 ? null : m.player1,
    }));

    await supabase.from("tournament_matches").insert(matchRows);
    await supabase.from("tournament_state")
      .update({ current_round: nextRound })
      .eq("tournament_id", "weekly-18");

    return NextResponse.json({ success: true, round: nextRound, matches: matchRows });
  }

  if (action === "report_result") {
    const { match_id, winner_wallet, player1_score, player2_score, reporter } = data;

    await supabase.from("tournament_matches").update({
      winner_wallet,
      player1_score,
      player2_score,
      status: "completed",
      reported_by: reporter,
    }).eq("id", match_id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  const { data: state } = await supabase
    .from("tournament_state")
    .select("*")
    .eq("tournament_id", "weekly-18")
    .single();

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("tournament_id", "weekly-18")
    .order("round", { ascending: true });

  const { data: players } = await supabase
    .from("tournament_registrations")
    .select("wallet_address, player_name, points, wins, losses, deck_name")
    .eq("tournament_id", "weekly-18");

  // Build standings
  const scores: Record<string, number> = {};
  (matches || []).filter((m: any) => m.winner_wallet).forEach((m: any) => {
    scores[m.winner_wallet] = (scores[m.winner_wallet] || 0) + 1;
  });

  const standings = (players || [])
    .map((p: any) => ({ ...p, match_wins: scores[p.wallet_address] || 0 }))
    .sort((a: any, b: any) => b.match_wins - a.match_wins);

  return NextResponse.json({ state, matches, standings });
}
