"use client";
import { useState, useEffect } from "react";
import { useConnectWallet, useWallets, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function WalletButton() {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { mutate: connectSui } = useConnectWallet();
  const { mutate: disconnectSui } = useDisconnectWallet();
  const suiWallets = useWallets();
  const account = useCurrentAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (account?.address) {
      localStorage.setItem("wavetcg_wallet_address", account.address);
    }
  }, [account?.address]);

  if (!mounted) return (
    <button style={{
      background: "linear-gradient(135deg, #1a8fe3, #4da2ff)",
      color: "#fff", border: "none", borderRadius: "6px",
      padding: "7px 14px", fontSize: "11px", fontWeight: 500,
      cursor: "pointer", letterSpacing: "0.06em",
      textTransform: "uppercase", fontFamily: "DM Sans, sans-serif",
    }}>Connect</button>
  );

  if (account) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          padding: "6px 12px",
          background: "rgba(77,162,255,0.1)",
          border: "1px solid rgba(77,162,255,0.3)",
          borderRadius: "6px", fontSize: "11px", color: "#78bfff",
          fontFamily: "DM Sans, sans-serif",
        }}>
          ◈ {account.address.slice(0,6)}...{account.address.slice(-4)}
        </div>
        <button onClick={() => disconnectSui()} style={{
          background: "transparent", border: "none",
          color: "#888898", fontSize: "11px", cursor: "pointer",
          fontFamily: "DM Sans, sans-serif",
        }}>Disconnect</button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: "linear-gradient(135deg, #1a8fe3, #4da2ff)",
          color: "#fff", border: "none", borderRadius: "6px",
          padding: "7px 14px", fontSize: "11px", fontWeight: 500,
          cursor: "pointer", letterSpacing: "0.06em",
          textTransform: "uppercase", fontFamily: "DM Sans, sans-serif",
        }}>
        Connect
      </button>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          paddingTop: "120px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#111118", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "320px",
            position: "relative", margin: "0 16px",
          }}>
            <button onClick={() => setShowModal(false)} style={{
              position: "absolute", top: "12px", right: "12px",
              background: "transparent", border: "none",
              color: "#888898", fontSize: "16px", cursor: "pointer",
            }}>✕</button>

            <h2 style={{
              fontFamily: "Cinzel, serif", fontSize: "16px",
              fontWeight: 600, color: "#e6e4f0", marginBottom: "4px",
            }}>Connect Wallet</h2>
            <p style={{ fontSize: "11px", color: "#888898", marginBottom: "20px" }}>
              Select a wallet to connect to WaveTCG
            </p>

            {suiWallets.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#4da2ff", marginBottom: "8px" }}>◈ Sui Wallets</div>
                {suiWallets.map((wallet: any) => (
                  <button key={wallet.name}
                    onClick={() => {
                      connectSui(
                        { wallet },
                        {
                          onSuccess: () => { setShowModal(false); },
                          onError: (e) => alert("Connection failed: " + e.message),
                        }
                      );
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      width: "100%", padding: "10px 14px", marginBottom: "6px",
                      background: "#18181f", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "10px", cursor: "pointer",
                      color: "#e6e4f0", fontSize: "13px", fontFamily: "DM Sans, sans-serif",
                      textAlign: "left",
                    }}>
                    {wallet.icon && <img src={wallet.icon} alt={wallet.name} style={{ width: "24px", height: "24px", borderRadius: "6px" }} />}
                    {wallet.name}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888898", marginBottom: "8px" }}>⟠ EVM Wallets (ETH · Polygon · Base)</div>
              <button onClick={() => { openConnectModal?.(); setShowModal(false); }} style={{
                display: "flex", alignItems: "center", gap: "12px",
                width: "100%", padding: "10px 14px",
                background: "#18181f", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", cursor: "pointer",
                color: "#e6e4f0", fontSize: "13px", fontFamily: "DM Sans, sans-serif",
                textAlign: "left",
              }}>
                <span style={{ fontSize: "20px" }}>⟠</span>
                MetaMask · Coinbase · WalletConnect · 300+
              </button>
            </div>

            <div style={{
              padding: "8px", background: "rgba(77,162,255,0.05)",
              border: "1px solid rgba(77,162,255,0.1)",
              borderRadius: "8px", fontSize: "10px", color: "#555562",
              textAlign: "center",
            }}>
              🔒 WaveTCG never stores your private keys
            </div>
          </div>
        </div>
      )}
    </>
  );
}
