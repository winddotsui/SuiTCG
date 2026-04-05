"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useCurrentAccount } from "@mysten/dapp-kit";

function OrdersContent() {
  const account = useCurrentAccount();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"selling" | "buying">("selling");
  const walletAddress = account?.address || localStorage.getItem("wavetcg_wallet_address") || "";

  useEffect(() => {
    if (walletAddress) fetchOrders(walletAddress);
    else setLoading(false);
  }, [walletAddress]);

  async function fetchOrders(addr: string) {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .or(`seller_address.eq.${addr},buyer_address.eq.${addr}`)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);

    // Mark seller orders as read
    await supabase
      .from("transactions")
      .update({ read_by_seller: true })
      .eq("seller_address", addr)
      .eq("read_by_seller", false);
  }

  async function markShipped(orderId: string) {
    await supabase.from("transactions").update({ status: "shipped" }).eq("id", orderId);
    setOrders(o => o.map(x => x.id === orderId ? { ...x, status: "shipped" } : x));
  }

  const sellerOrders = orders.filter(o => o.seller_address === walletAddress);
  const buyerOrders = orders.filter(o => o.buyer_address === walletAddress);
  const displayOrders = activeTab === "selling" ? sellerOrders : buyerOrders;

  const statusColor: Record<string, string> = {
    paid: "#00d4ff", shipped: "#00ff88", completed: "#00ff88", pending: "#ffcc00"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000008", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 900, marginBottom: "6px" }}>📦 Orders</h1>
        <p style={{ color: "#8899bb", fontSize: "14px", marginBottom: "28px" }}>Manage your sales and purchases</p>

        {!walletAddress ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8899bb" }}>
            Connect your wallet to see orders.
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {[
                { key: "selling", label: `📤 Selling (${sellerOrders.length})` },
                { key: "buying", label: `📥 Buying (${buyerOrders.length})` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  style={{ padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", border: activeTab === tab.key ? "1px solid #0099ff" : "1px solid rgba(255,255,255,0.1)", background: activeTab === tab.key ? "rgba(0,153,255,0.1)" : "transparent", color: activeTab === tab.key ? "#0099ff" : "#8899bb" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ color: "#0099ff", textAlign: "center", padding: "40px" }}>Loading...</div>
            ) : displayOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#8899bb" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <p>No {activeTab === "selling" ? "sales" : "purchases"} yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {displayOrders.map(order => (
                  <div key={order.id} style={{ background: "#050515", border: `1px solid ${order.read_by_seller === false && activeTab === "selling" ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "24px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        {order.read_by_seller === false && activeTab === "selling" && (
                          <span style={{ fontSize: "10px", background: "rgba(0,212,255,0.15)", color: "#00d4ff", padding: "2px 8px", borderRadius: "10px", marginBottom: "6px", display: "inline-block" }}>🔔 NEW</span>
                        )}
                        <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "18px", color: "#fff", margin: 0 }}>{order.card_name || "Card"}</h3>
                        <p style={{ fontSize: "12px", color: "#8899bb", marginTop: "4px" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "20px", fontWeight: 700, color: "#00d4ff" }}>{order.price_sui} SUI</div>
                        <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", background: `${statusColor[order.status] || "#fff"}15`, color: statusColor[order.status] || "#fff", border: `1px solid ${statusColor[order.status] || "#fff"}30` }}>
                          {order.status?.toUpperCase() || "PAID"}
                        </span>
                      </div>
                    </div>

                    {/* Shipping Details (seller view) */}
                    {activeTab === "selling" && order.shipping_name && (
                      <div style={{ background: "#0a1628", border: "1px solid rgba(0,153,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#0099ff", marginBottom: "12px" }}>📦 Buyer Shipping Details</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {[
                            ["Full Name", order.shipping_name],
                            ["Phone", order.shipping_phone],
                            ["Email", order.shipping_email],
                            ["ZIP Code", order.shipping_zip],
                            ["Address", order.shipping_address],
                            ["City", order.shipping_city],
                            ["Province", order.shipping_province],
                            ["Country", order.shipping_country],
                          ].map(([label, value]) => value ? (
                            <div key={label}>
                              <div style={{ fontSize: "10px", color: "#8899bb", marginBottom: "2px" }}>{label}</div>
                              <div style={{ fontSize: "13px", color: "#fff" }}>{value}</div>
                            </div>
                          ) : null)}
                        </div>
                        {order.shipping_notes && (
                          <div style={{ marginTop: "10px", padding: "10px", background: "rgba(255,204,0,0.05)", border: "1px solid rgba(255,204,0,0.15)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "10px", color: "#ffcc00", marginBottom: "4px" }}>Delivery Notes</div>
                            <div style={{ fontSize: "13px", color: "#c8d8f0" }}>{order.shipping_notes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tx link */}
                    {order.tx_digest && (
                      <a href={`https://suiexplorer.com/txblock/${order.tx_digest}?network=${process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet"}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "11px", color: "#0099ff", display: "block", marginBottom: "12px" }}>
                        View Transaction ↗
                      </a>
                    )}

                    {/* Mark as shipped */}
                    {activeTab === "selling" && order.status === "paid" && (
                      <button onClick={() => markShipped(order.id)}
                        style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                        ✅ Mark as Shipped
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <OrdersContent />;
}
