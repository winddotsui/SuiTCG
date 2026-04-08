"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle"|"camera"|"scanning"|"result">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const startCamera = async () => {
    try {
      setError("");
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(s);
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError("Camera access denied. Please allow camera access or upload a photo.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setMode("idle");
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  }, [stream]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (dataUrl: string) => {
    setMode("scanning");
    setLoading(true);
    setError("");
    try {
      const base64 = dataUrl.split(",")[1];
      const res = await fetch("/api/scan-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setMode("result");
    } catch (e: any) {
      setError(e.message || "Failed to identify card. Try a clearer photo.");
      setMode("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleListCard = () => {
    if (!result) return;
    const params = new URLSearchParams({
      name: result.name || "",
      game: result.game || "",
      set_name: result.set || "",
      card_number: result.number || "",
      condition: result.condition || "NM",
      price_usd: result.price || "",
      description: result.description || "",
    });
    router.push(`/sell?${params.toString()}`);
  };

  const reset = () => {
    setMode("idle");
    setPreview("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000008", color: "#fff", fontFamily: "DM Sans, sans-serif", padding: "0 0 80px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes scanLine { 0%{top:10%}50%{top:85%}100%{top:10%} }
        .scan-line { position:absolute;left:5%;width:90%;height:2px;background:linear-gradient(90deg,transparent,#0099ff,transparent);animation:scanLine 2s ease-in-out infinite;box-shadow:0 0 10px #0099ff; }
        .btn-primary { background:linear-gradient(135deg,#0055ff,#0099ff);color:#fff;border:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;width:100%; }
        .btn-primary:hover { opacity:0.9;transform:translateY(-1px); }
        .btn-secondary { background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12);padding:14px 28px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s;width:100%; }
        .btn-secondary:hover { border-color:rgba(255,255,255,0.25);color:#fff; }
        .result-row { display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06); }
        .result-label { font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em; }
        .result-value { font-size:14px;color:#fff;font-weight:500;text-align:right;max-width:60%; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 24px 0", maxWidth: "560px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <a href="/marketplace" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "13px" }}>← Back</a>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", color: "#0099ff", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Card Scanner</span>
        </div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, color: "#fff", marginBottom: "8px", lineHeight: 1.1 }}>Scan & List</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "32px" }}>
          Point your camera at any TCG card. AI identifies it instantly and pre-fills your listing.
        </p>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

        {/* ERROR */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", fontSize: "14px", color: "#fca5a5" }}>
            ⚠️ {error}
          </div>
        )}

        {/* IDLE STATE */}
        {mode === "idle" && !preview && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Drag & Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: dragging ? "rgba(0,153,255,0.08)" : "#050515",
                border: dragging ? "2px dashed #0099ff" : "2px dashed rgba(0,153,255,0.2)",
                borderRadius: "16px",
                padding: "48px 24px",
                textAlign: "center",
                marginBottom: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>{dragging ? "⬇️" : "📷"}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                {dragging ? "Drop your card image here" : "Drag & Drop or Click to Upload"}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: 0 }}>
                Supports One Piece, Pokémon, Magic, Yu-Gi-Oh! and all major TCGs<br />
                <span style={{ color: "rgba(0,153,255,0.6)" }}>PNG, JPG, WEBP accepted</span>
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="btn-primary" onClick={startCamera}>
                📷 Camera
              </button>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                🖼️ Upload
              </button>
            </div>

            {/* How it works */}
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", marginTop: "8px" }}>
              <div style={{ fontSize: "11px", color: "#0099ff", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: "14px" }}>How it works</div>
              {[
                { n: "1", t: "Scan or upload", d: "Take a photo of your card or upload from your gallery" },
                { n: "2", t: "AI identifies", d: "Claude AI recognizes the card name, set, and condition" },
                { n: "3", t: "Review & list", d: "Confirm details, set your price, and list in seconds" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < 2 ? "14px" : "0" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,153,255,0.15)", border: "1px solid rgba(0,153,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0099ff", flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{s.t}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMERA MODE */}
        {mode === "camera" && (
          <div>
            <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000", marginBottom: "16px", aspectRatio: "4/3" }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} playsInline muted />
              {/* Scan overlay */}
              <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(0,153,255,0.3)" }} />
              <div style={{ position: "absolute", top: "10%", left: "5%", width: "90%", height: "80%", border: "2px solid rgba(0,153,255,0.6)", borderRadius: "8px" }}>
                <div className="scan-line" />
                {/* Corner brackets */}
                {[{t:0,l:0},{t:0,r:0},{b:0,l:0},{b:0,r:0}].map((pos, i) => (
                  <div key={i} style={{ position: "absolute", width: "20px", height: "20px", ...pos, borderColor: "#0099ff", borderStyle: "solid", borderWidth: pos.t===0&&pos.l===0?"2px 0 0 2px":pos.t===0&&"r" in pos?"2px 2px 0 0":pos.b===0&&pos.l===0?"0 0 2px 2px":"0 2px 2px 0" }} />
                ))}
              </div>
              <div style={{ position: "absolute", bottom: "12px", left: 0, right: 0, textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                Position card within the frame
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-primary" onClick={capturePhoto}>📸 Capture</button>
              <button className="btn-secondary" onClick={stopCamera} style={{ width: "auto", padding: "14px 20px" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* SCANNING STATE */}
        {mode === "scanning" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            {preview && <img src={preview} alt="Card" style={{ width: "180px", borderRadius: "12px", marginBottom: "24px", opacity: 0.7 }} />}
            <div style={{ width: "48px", height: "48px", border: "3px solid rgba(0,153,255,0.2)", borderTopColor: "#0099ff", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontFamily: "Cinzel, serif", fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Identifying Card...</div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", animation: "pulse 2s infinite" }}>Claude AI is analyzing your card</p>
          </div>
        )}

        {/* RESULT STATE */}
        {mode === "result" && result && (
          <div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "flex-start" }}>
              {preview && (
                <img src={preview} alt="Card" style={{ width: "100px", borderRadius: "10px", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "20px", marginBottom: "10px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
                  <span style={{ fontSize: "10px", color: "#00ff88", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Card Identified</span>
                </div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{result.name}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{result.game}</div>
              </div>
            </div>

            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "4px 20px", marginBottom: "20px" }}>
              {[
                { label: "Game", value: result.game },
                { label: "Set", value: result.set || "—" },
                { label: "Card Number", value: result.number || "—" },
                { label: "Condition", value: result.condition || "NM" },
                { label: "Est. Price", value: result.price ? `$${result.price}` : "—" },
                { label: "Rarity", value: result.rarity || "—" },
              ].map((row, i) => row.value !== "—" && (
                <div key={i} className="result-row">
                  <span className="result-label">{row.label}</span>
                  <span className="result-value">{row.value}</span>
                </div>
              ))}
            </div>

            {result.description && (
              <div style={{ background: "rgba(0,153,255,0.05)", border: "1px solid rgba(0,153,255,0.12)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                💡 {result.description}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="btn-primary" onClick={handleListCard}>
                🚀 List This Card on WaveTCG
              </button>
              <button className="btn-secondary" onClick={reset}>
                📷 Scan Another Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
