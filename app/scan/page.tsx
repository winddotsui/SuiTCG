"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle"|"camera"|"scanning"|"result">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const isMobile = typeof window !== "undefined" && /iPhone|iPad|Android/i.test(navigator.userAgent);

  const startCamera = async () => {
    try {
      setError("");
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      setMode("camera");
      // Try multiple times to attach stream to video
      let attempts = 0;
      const attach = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        } else if (attempts < 10) {
          attempts++;
          setTimeout(attach, 100);
        }
      };
      setTimeout(attach, 50);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please upload a photo instead.");
      } else {
        setError("Camera error. Please upload a photo instead.");
      }
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setMode("idle");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (!dataUrl || dataUrl === "data:,") {
      setError("Could not capture photo. Please try uploading instead.");
      return;
    }
    // Stop stream
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setMode("idle");
    setPreview(dataUrl);
    analyzeImage(dataUrl);
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const analyzeImage = async (dataUrl: string) => {
    setMode("scanning");
    setError("");
    try {
      const res = await fetch("/api/scan-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setMode("result");
    } catch (e: any) {
      setError(e.message || "Failed to identify card. Try a clearer photo.");
      setMode("idle");
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
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000008", color: "#fff", fontFamily: "DM Sans, sans-serif", paddingBottom: "80px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes scanLine{0%{top:8%}50%{top:82%}100%{top:8%}}
        .scan-line{position:absolute;left:4%;width:92%;height:2px;background:linear-gradient(90deg,transparent,#0099ff,transparent);animation:scanLine 2s ease-in-out infinite}
        .btn-blue{background:linear-gradient(135deg,#0055ff,#0099ff);color:#fff;border:none;padding:16px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;width:100%;transition:all 0.2s}
        .btn-blue:hover{opacity:0.9;transform:translateY(-1px)}
        .btn-ghost{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12);padding:16px;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;width:100%;transition:all 0.2s}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.25);color:#fff}
        .drop-zone{border:2px dashed rgba(0,153,255,0.25);border-radius:16px;padding:40px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#050515}
        .drop-zone:hover,.drop-zone.drag{border-color:#0099ff;background:rgba(0,153,255,0.05)}
        .result-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
      `}</style>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: "none" }} />

      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "32px 20px 0" }}>
        {/* Back + badge */}
        <a href="/marketplace" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "13px", display: "inline-block", marginBottom: "20px" }}>← Back</a>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.2)", borderRadius: "20px", marginBottom: "14px", marginLeft: "12px" }}>
          <span style={{ fontSize: "10px", color: "#0099ff", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Card Scanner</span>
        </div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(26px,6vw,40px)", fontWeight: 700, color: "#fff", marginBottom: "8px", lineHeight: 1.1 }}>Scan & List</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: "28px" }}>
          Scan any TCG card with your camera or upload a photo. AI identifies it and pre-fills your listing instantly.
        </p>

        {/* ERROR */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", fontSize: "13px", color: "#fca5a5", lineHeight: 1.6 }}>
            ⚠️ {error}
          </div>
        )}

        {/* IDLE */}
        {mode === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Drop zone */}
            <div
              className={`drop-zone${dragging ? " drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: "52px", marginBottom: "14px" }}>{dragging ? "⬇️" : "🃏"}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                {dragging ? "Drop image here" : "Drag & Drop or Click to Upload"}
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                One Piece · Pokémon · Magic · Yu-Gi-Oh! · All TCGs
              </p>
              <p style={{ fontSize: "11px", color: "rgba(0,153,255,0.5)", marginTop: "6px", marginBottom: 0 }}>PNG · JPG · WEBP · HEIC</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="btn-blue" onClick={startCamera}>📷 Open Camera</button>
              <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>🖼️ Upload</button>
            </div>
            <button className="btn-ghost" onClick={() => cameraInputRef.current?.click()} style={{marginTop:"0"}}>
              📸 Take Photo (Native Camera)
            </button>
            <div style={{display:"none"}}>
            </div>

            {/* Supported games */}
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "18px 20px", marginTop: "4px" }}>
              <div style={{ fontSize: "10px", color: "#0099ff", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "12px" }}>Supported TCGs</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["☠️ One Piece","⚡ Pokémon","✨ Magic","👁️ Yu-Gi-Oh!","🐉 Dragon Ball","🌟 Lorcana","⚔️ Flesh & Blood","🎭 Digimon"].map(g => (
                  <span key={g} style={{ fontSize: "11px", padding: "4px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", color: "rgba(255,255,255,0.5)" }}>{g}</span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div style={{ background: "#050515", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "18px 20px" }}>
              <div style={{ fontSize: "10px", color: "#0099ff", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "14px" }}>How it works</div>
              {[
                { n:"1", t:"Scan or upload", d:"Take a photo or upload from gallery" },
                { n:"2", t:"AI identifies", d:"Claude AI recognizes name, set, rarity & price" },
                { n:"3", t:"List instantly", d:"Pre-filled form — just confirm and list" },
              ].map((s,i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom: i<2?"12px":"0" }}>
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"rgba(0,153,255,0.12)", border:"1px solid rgba(0,153,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, color:"#0099ff", flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:"#fff", marginBottom:"2px" }}>{s.t}</div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)" }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMERA (desktop only) */}
        {mode === "camera" && (
          <div>
            <div style={{ position:"relative", borderRadius:"16px", overflow:"hidden", background:"#000", marginBottom:"14px", aspectRatio:"4/3" }}>
              <video ref={videoRef} style={{ width:"100%", height:"100%", objectFit:"cover" }} playsInline muted autoPlay onCanPlay={e => (e.currentTarget as HTMLVideoElement).play()} />
              <div style={{ position:"absolute", inset:0, border:"2px solid rgba(0,153,255,0.2)" }} />
              <div style={{ position:"absolute", top:"8%", left:"5%", width:"90%", height:"82%", border:"2px solid rgba(0,153,255,0.7)", borderRadius:"8px" }}>
                <div className="scan-line" />
              </div>
              <div style={{ position:"absolute", bottom:"14px", left:0, right:0, textAlign:"center", fontSize:"12px", color:"rgba(255,255,255,0.5)" }}>
                Position card within frame
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display:"none" }} />
            <div style={{ display:"flex", gap:"10px" }}>
              <button className="btn-blue" onClick={capturePhoto}>📸 Capture Photo</button>
              <button className="btn-ghost" onClick={stopCamera} style={{ width:"auto", padding:"16px 24px" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* SCANNING */}
        {mode === "scanning" && (
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            {preview && <img src={preview} alt="Card" style={{ width:"160px", borderRadius:"12px", marginBottom:"28px", opacity:0.6, boxShadow:"0 8px 32px rgba(0,0,0,0.8)" }} />}
            <div style={{ width:"44px", height:"44px", border:"3px solid rgba(0,153,255,0.15)", borderTopColor:"#0099ff", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 0.8s linear infinite" }} />
            <div style={{ fontFamily:"Cinzel, serif", fontSize:"18px", fontWeight:600, color:"#fff", marginBottom:"8px" }}>Identifying Card...</div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", animation:"pulse 2s infinite", margin:0 }}>Claude AI is analyzing your card</p>
          </div>
        )}

        {/* RESULT */}
        {mode === "result" && result && (
          <div>
            {/* Card preview + name */}
            <div style={{ display:"flex", gap:"16px", marginBottom:"20px", alignItems:"flex-start" }}>
              {preview && <img src={preview} alt="Card" style={{ width:"90px", borderRadius:"10px", flexShrink:0, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 4px 20px rgba(0,0,0,0.6)" }} />}
              <div style={{ flex:1 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:"20px", marginBottom:"10px" }}>
                  <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#00ff88", display:"inline-block" }} />
                  <span style={{ fontSize:"10px", color:"#00ff88", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>Card Identified</span>
                </div>
                <div style={{ fontFamily:"Cinzel, serif", fontSize:"18px", fontWeight:700, color:"#fff", marginBottom:"4px", lineHeight:1.2 }}>{result.name}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{result.game}</div>
                {result.confidence && <div style={{ fontSize:"10px", color: result.confidence==="high"?"#00ff88":result.confidence==="medium"?"#ffcc00":"#ff6b6b", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>{result.confidence} confidence</div>}
              </div>
            </div>

            {/* Details */}
            <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"4px 20px", marginBottom:"16px" }}>
              {[
                { label:"Set", value: result.set },
                { label:"Card Number", value: result.number },
                { label:"Rarity", value: result.rarity },
                { label:"Condition", value: result.condition },
                { label:"Est. Price", value: result.price ? `$${result.price}` : null },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="result-row">
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{row.label}</span>
                  <span style={{ fontSize:"13px", color:"#fff", fontWeight:500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {result.description && (
              <div style={{ background:"rgba(0,153,255,0.04)", border:"1px solid rgba(0,153,255,0.1)", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px", fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
                💡 {result.description}
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <button className="btn-blue" onClick={handleListCard}>🚀 List This Card on WaveTCG</button>
              <button className="btn-ghost" onClick={reset}>📷 Scan Another Card</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
