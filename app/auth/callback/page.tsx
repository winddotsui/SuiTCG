"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const [status, setStatus] = useState("Processing login...");
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");

        if (!idToken) {
          setStatus("No token found. Redirecting...");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        const { jwtToAddress } = await import("@mysten/zklogin");
        const { decodeJwt } = await import("jose");

        const decoded = decodeJwt(idToken);
        const address = jwtToAddress(idToken, localStorage.getItem("wavetcg_zklogin_randomness") || "");

        const user = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          address,
          idToken,
        };

        localStorage.setItem("wavetcg_user", JSON.stringify(user));
        setStatus("Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 1500);
      } catch (e: any) {
        console.error(e);
        setStatus("Login failed. Redirecting...");
        setTimeout(() => router.push("/"), 2000);
      }
    }

    handleCallback();
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>🌊</div>
        <div style={{
          fontFamily: "Cinzel, serif", fontSize: "18px",
          color: "#e6e4f0", marginBottom: "8px",
        }}>WaveTCG</div>
        <div style={{ fontSize: "14px", color: "#888898" }}>{status}</div>
      </div>
    </div>
  );
}
