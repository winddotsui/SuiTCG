import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { rateLimit, getIP } from "../../../lib/rateLimit";

// Dynamic tournament ID based on week number since launch (April 6 2026 = Week 1)
function getCurrentTournamentId(): string {
  const LAUNCH_DATE = new Date("2026-04-06T00:00:00+08:00");
  const now = new Date();
  const weekNum = Math.max(1, Math.ceil((now.getTime() - LAUNCH_DATE.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  return process.env.NEXT_PUBLIC_TOURNAMENT_ID || `weekly-${weekNum}`;
}
const TOURNAMENT_ID = getCurrentTournamentId();

export async function POST(request: Request) {
  const ip = getIP(request);
  if (!rateLimit(ip, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { action, data, adminKey } = await request.json();

  // Admin actions require secret key
  const ADMIN_WALLET = "0x91fa18b29e0603c18005f61479dd47e50cb52c85ede36c6dc44d85bc147c77f5";
  const ADMIN_ACTIONS = ["start", "next_round"];
  if (ADMIN_ACTIONS.includes(action)) {
    if (data?.callerWallet !== ADMIN_WALLET && adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (action === "start") {
    // Get all registered players
    const { data: players } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("tournament_id", TOURNAMENT_ID)
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
      tournament_id: TOURNAMENT_ID,
      round: 1,
      player1_wallet: m.player1,
      player2_wallet: m.player2 || null,
      status: m.player2 ? "pending" : "bye",
      winner_wallet: m.player2 ? null : m.player1,
    }));

    await supabase.from("tournament_matches").insert(matchRows);

    // Update tournament state
    await supabase.from("tournament_state").upsert({
      tournament_id: TOURNAMENT_ID,
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
      .eq("tournament_id", TOURNAMENT_ID)
      .single();

    if (!state) return NextResponse.json({ error: "No active tournament" }, { status: 400 });

    const nextRound = state.current_round + 1;

    // Get all matches so far to calculate standings
    const { data: allMatches } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", TOURNAMENT_ID)
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
      .eq("tournament_id", TOURNAMENT_ID);

    const { Swiss } = await import("tournament-pairings");
    const swissPlayers = (players || []).map((p: any) => ({
      id: p.wallet_address,
      score: scores[p.wallet_address] || 0,
    }));

    const matches = Swiss(swissPlayers, nextRound);
    const matchRows = matches.map((m: any) => ({
      tournament_id: TOURNAMENT_ID,
      round: nextRound,
      player1_wallet: m.player1,
      player2_wallet: m.player2 || null,
      status: m.player2 ? "pending" : "bye",
      winner_wallet: m.player2 ? null : m.player1,
    }));

    await supabase.from("tournament_matches").insert(matchRows);
    await supabase.from("tournament_state")
      .update({ current_round: nextRound })
      .eq("tournament_id", TOURNAMENT_ID);

    return NextResponse.json({ success: true, round: nextRound, matches: matchRows });
  }

  if (action === "report_result") {
    const { match_id, winner_wallet, player1_score, player2_score, reporter } = data;

    // Validate match exists and reporter is a participant or admin
    const { data: match } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const isAdmin = data?.callerWallet === ADMIN_WALLET || adminKey === process.env.ADMIN_SECRET_KEY;
    const isParticipant = reporter === match.player1_wallet || reporter === match.player2_wallet;

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: "Unauthorized - not a match participant" }, { status: 401 });
    }

    // Validate winner is one of the players
    if (winner_wallet !== match.player1_wallet && winner_wallet !== match.player2_wallet) {
      return NextResponse.json({ error: "Invalid winner - not a match participant" }, { status: 400 });
    }

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
    .eq("tournament_id", TOURNAMENT_ID)
    .single();

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("tournament_id", TOURNAMENT_ID)
    .order("round", { ascending: true });

  const { data: players } = await supabase
    .from("tournament_registrations")
    .select("wallet_address, player_name, points, wins, losses, deck_name")
    .eq("tournament_id", TOURNAMENT_ID);

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
