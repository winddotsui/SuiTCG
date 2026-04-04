'use client';

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const TOURNAMENT_ID = process.env.NEXT_PUBLIC_TOURNAMENT_ID || "";
const ENTRY_FEE = BigInt("10000000000");

export default function OPTCGPage() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [status, setStatus] = useState("idle");
  const [txDigest, setTxDigest] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!account) return;
    setStatus("pending");
    setError("");
    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [ENTRY_FEE]);
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::join_tournament`,
        arguments: [tx.object(TOURNAMENT_ID), coin],
      });
      const result = await signAndExecute({ transaction: tx });
      setTxDigest(result.digest);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000008", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏴‍☠️</div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "36px", fontWeight: 900, background: "linear-gradient(135deg, #0099ff, #00ffcc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>OPTCG Tournament</h1>
        <p style={{ color: "#8899bb", fontSize: "15px", marginBottom: "32px" }}>One Piece TCG Weekly · Entry: 10 SUI · Paid on-chain</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "480px", margin: "0 auto 40px" }}>
          {[["10 SUI", "Entry Fee"], ["64", "Max Players"], ["Top 3", "Win Prizes"]].map(([val, label]) => (
            <div key={label} style={{ background: "rgba(0,153,255,0.06)", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px 8px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#00d4ff" }}>{val}</div>
              <div style={{ fontSize: "11px", color: "#8899bb", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {!account ? (
          <div>
            <p style={{ color: "#8899bb", marginBottom: "16px" }}>Connect your Sui wallet to register</p>
            <ConnectButton />
          </div>
        ) : status === "success" ? (
          <div style={{ background: "rgba(0,255,100,0.05)", border: "1px solid rgba(0,255,100,0.2)", borderRadius: "16px", padding: "32px", maxWidth: "400px", margin: "0 auto" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#00ff88", marginBottom: "8px" }}>You're Registered!</div>
            <p style={{ color: "#8899bb", fontSize: "13px", marginBottom: "16px" }}>10 SUI paid on-chain successfully.</p>
            <a href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`} target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff", fontSize: "12px" }}>View Transaction ↗</a>
          </div>
        ) : (
          <div>
            {error && <p style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button
              onClick={handleJoin}
              disabled={status === "pending"}
              style={{ background: status === "pending" ? "rgba(0,153,255,0.3)" : "linear-gradient(135deg, #0055ff, #0099ff)", color: "#fff", border: "none", borderRadius: "12px", padding: "16px 40px", fontSize: "16px", fontWeight: 700, cursor: status === "pending" ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif" }}
            >
              {status === "pending" ? "Signing Transaction..." : "Pay 10 SUI & Register →"}
            </button>
            <p style={{ color: "#444460", fontSize: "11px", marginTop: "10px" }}>10 SUI deducted from your wallet via smart contract</p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ background: "rgba(255,180,0,0.05)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: "12px", padding: "14px 18px", fontSize: "12px", color: "#c8a84b" }}>
          ⚠️ Testnet only — SUI here has no real value. Get free testnet SUI at <a href="https://faucet.sui.io" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff" }}>faucet.sui.io</a>
        </div>
      </div>
    </div>
  );
}
