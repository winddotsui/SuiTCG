"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<any>(null);
  const [mode, setMode] = useState<"idle"|"camera"|"scanning"|"result">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoScanCountdown, setAutoScanCountdown] = useState(3);
  const [autoScanning, setAutoScanning] = useState(false);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraReady(false);
    setAutoScanning(false);
    setMode("idle");
  }, [stream]);

  const startCamera = async () => {
    try {
      setError("");
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(s);
      setMode("camera");
      setCameraReady(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: any) {
      setError(err.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera in browser settings."
        : "Camera not available. Please upload a photo instead.");
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return dataUrl === "data:," ? null : dataUrl;
  }, []);

  const analyzeImage = useCallback(async (dataUrl: string) => {
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
      if (!data.name) throw new Error("Could not identify card. Try better lighting or a clearer angle.");
      setResult(data);
      setMode("result");
    } catch (e: any) {
      setError(e.message || "Could not identify card. Try again.");
      setMode("camera");
    }
  }, []);

  const captureAndScan = useCallback(() => {
    const dataUrl = captureFrame();
    if (!dataUrl) { setError("Could not capture frame. Try again."); return; }
    setPreview(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  }, [captureFrame, stopCamera, analyzeImage]);

  // Auto scan countdown
  const startAutoScan = useCallback(() => {
    setAutoScanning(true);
    setAutoScanCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setAutoScanCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setAutoScanning(false);
        captureAndScan();
      }
    }, 1000);
    scanIntervalRef.current = interval;
  }, [captureAndScan]);

  const cancelAutoScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setAutoScanning(false);
    setAutoScanCountdown(3);
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev => {
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

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  return (
    <div style={{ minHeight:"100vh", background:"#000008", color:"#fff", fontFamily:"DM Sans, sans-serif", paddingBottom:"80px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes scanBeam{0%{top:5%}50%{top:88%}100%{top:5%}}
        @keyframes countdown{from{stroke-dashoffset:0}to{stroke-dashoffset:283}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .btn-blue{background:linear-gradient(135deg,#0055ff,#0099ff);color:#fff;border:none;padding:16px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;width:100%;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-blue:hover{opacity:0.9;transform:translateY(-1px)}
        .btn-blue:active{transform:translateY(0)}
        .btn-ghost{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);padding:16px;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;width:100%;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.2);color:#fff}
        .drop-zone{border:2px dashed rgba(0,153,255,0.2);border-radius:16px;padding:36px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#050515}
        .drop-zone:hover,.drop-zone.drag{border-color:#0099ff;background:rgba(0,153,255,0.04)}
        .scan-beam{position:absolute;left:0;width:100%;height:3px;background:linear-gradient(90deg,transparent 0%,rgba(0,153,255,0.8) 40%,#00d4ff 50%,rgba(0,153,255,0.8) 60%,transparent 100%);animation:scanBeam 2s ease-in-out infinite;box-shadow:0 0 12px rgba(0,153,255,0.6)}
        .corner{position:absolute;width:24px;height:24px;border-color:#0099ff;border-style:solid}
        .result-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
        .game-tag{font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45)}
      `}</style>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display:"none" }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display:"none" }} />
      <canvas ref={canvasRef} style={{ display:"none" }} />

      <div style={{ maxWidth:"540px", margin:"0 auto", padding:"28px 20px 0" }}>
        <a href="/marketplace" style={{ color:"rgba(255,255,255,0.3)", textDecoration:"none", fontSize:"13px", display:"inline-block", marginBottom:"20px" }}>← Back</a>

        {/* IDLE */}
        {mode === "idle" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ marginBottom:"24px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:"rgba(0,153,255,0.08)", border:"1px solid rgba(0,153,255,0.18)", borderRadius:"20px", marginBottom:"12px" }}>
                <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#0099ff", display:"inline-block" }} />
                <span style={{ fontSize:"10px", color:"#0099ff", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>AI Card Scanner</span>
              </div>
              <h1 style={{ fontFamily:"Cinzel, serif", fontSize:"clamp(26px,6vw,38px)", fontWeight:700, color:"#fff", marginBottom:"8px", lineHeight:1.1 }}>Scan & List</h1>
              <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.35)", lineHeight:1.7, margin:0 }}>
                Scan any TCG card — AI identifies name, set, rarity and market price instantly.
              </p>
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px", fontSize:"13px", color:"#fca5a5", lineHeight:1.6 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`drop-zone${dragging?" drag":""}`}
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={handleDrop}
              onClick={()=>fileInputRef.current?.click()}
              style={{ marginBottom:"12px" }}
            >
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>{dragging?"⬇️":"🃏"}</div>
              <div style={{ fontFamily:"Cinzel, serif", fontSize:"15px", fontWeight:600, color:"#fff", marginBottom:"6px" }}>
                {dragging ? "Drop card image here" : "Drag & Drop or Click to Upload"}
              </div>
              <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)", margin:"0 0 6px" }}>PNG · JPG · WEBP · HEIC</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
              <button className="btn-blue" onClick={() => { startCamera(); setTimeout(() => startAutoScan(), 1500); }}>⚡ Auto Scan</button>
              <button className="btn-ghost" onClick={()=>cameraInputRef.current?.click()}>📸 Take Photo</button>
            </div>
            <button className="btn-ghost" onClick={()=>fileInputRef.current?.click()} style={{ marginBottom:"20px" }}>🖼️ Upload from Gallery</button>

            {/* Supported games */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"20px" }}>
              {["☠️ One Piece","⚡ Pokémon","✨ Magic","👁️ Yu-Gi-Oh!","🐉 Dragon Ball","🌟 Lorcana","⚔️ Flesh & Blood","🎭 Digimon"].map(g=>(
                <span key={g} className="game-tag">{g}</span>
              ))}
            </div>

            {/* Tips */}
            <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"10px", color:"#0099ff", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, marginBottom:"12px" }}>📸 Scanning Tips</div>
              {[
                "Good lighting — avoid shadows on the card",
                "Fill the frame — card should take up most of the image",
                "Keep steady — avoid motion blur",
                "Clean card face — remove sleeves if needed for accuracy",
              ].map((tip,i)=>(
                <div key={i} style={{ display:"flex", gap:"8px", marginBottom: i<3?"8px":"0", fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>
                  <span style={{ color:"#0099ff", flexShrink:0 }}>✓</span> {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMERA */}
        {mode === "camera" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ marginBottom:"14px" }}>
              <div style={{ fontFamily:"Cinzel, serif", fontSize:"18px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>Live Scanner</div>
              <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", margin:0 }}>Position the card within the frame, then tap Scan</p>
            </div>

            {/* Video */}
            <div style={{ position:"relative", borderRadius:"16px", overflow:"hidden", background:"#000", marginBottom:"16px", aspectRatio:"4/3", border:"1px solid rgba(0,153,255,0.2)" }}>
              <video
                ref={videoRef}
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                playsInline muted autoPlay
                onCanPlay={() => { setCameraReady(true); videoRef.current?.play(); }}
              />

              {/* Frame overlay */}
              {cameraReady && (
                <>
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.25)" }} />
                  {/* Card frame cutout effect */}
                  <div style={{ position:"absolute", top:"8%", left:"8%", right:"8%", bottom:"8%", border:"2px solid rgba(0,153,255,0.8)", borderRadius:"8px" }}>
                    <div className="scan-beam" />
                    {/* Corners */}
                    <div className="corner" style={{ top:0, left:0, borderWidth:"3px 0 0 3px", borderRadius:"4px 0 0 0" }} />
                    <div className="corner" style={{ top:0, right:0, borderWidth:"3px 3px 0 0", borderRadius:"0 4px 0 0" }} />
                    <div className="corner" style={{ bottom:0, left:0, borderWidth:"0 0 3px 3px", borderRadius:"0 0 0 4px" }} />
                    <div className="corner" style={{ bottom:0, right:0, borderWidth:"0 3px 3px 0", borderRadius:"0 0 4px 0" }} />
                  </div>

                  {/* Countdown overlay */}
                  {autoScanning && (
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", zIndex:10 }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"Cinzel, serif", fontSize:"72px", fontWeight:900, color:"#0099ff", lineHeight:1 }}>{autoScanCountdown}</div>
                        <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", marginTop:"8px" }}>Scanning in...</div>
                        <button onClick={cancelAutoScan} style={{ marginTop:"16px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", padding:"8px 20px", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"12px" }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div style={{ position:"absolute", bottom:"12px", left:0, right:0, textAlign:"center", fontSize:"11px", color:"rgba(255,255,255,0.5)" }}>
                    Fill card within the blue frame
                  </div>
                </>
              )}

              {!cameraReady && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
                  <div style={{ width:"32px", height:"32px", border:"3px solid rgba(0,153,255,0.2)", borderTopColor:"#0099ff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>Starting camera...</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
              <button
                className="btn-blue"
                onClick={captureAndScan}
                disabled={!cameraReady}
                style={{ opacity: cameraReady ? 1 : 0.4 }}
              >
                📸 Scan Now
              </button>
              <button
                className="btn-ghost"
                onClick={autoScanning ? cancelAutoScan : startAutoScan}
                disabled={!cameraReady}
                style={{ opacity: cameraReady ? 1 : 0.4 }}
              >
                {autoScanning ? "⏹ Cancel" : "⏱ Auto (3s)"}
              </button>
            </div>
            <button className="btn-ghost" onClick={stopCamera}>✕ Cancel</button>
          </div>
        )}

        {/* SCANNING */}
        {mode === "scanning" && (
          <div style={{ textAlign:"center", padding:"60px 0", animation:"fadeIn 0.3s ease" }}>
            {preview && <img src={preview} alt="Card" style={{ width:"160px", borderRadius:"12px", marginBottom:"28px", opacity:0.6, boxShadow:"0 8px 32px rgba(0,0,0,0.8)" }} />}
            <div style={{ width:"48px", height:"48px", border:"3px solid rgba(0,153,255,0.15)", borderTopColor:"#0099ff", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 0.8s linear infinite" }} />
            <div style={{ fontFamily:"Cinzel, serif", fontSize:"20px", fontWeight:600, color:"#fff", marginBottom:"8px" }}>Identifying Card...</div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", animation:"pulse 2s infinite", margin:0 }}>Claude AI is analyzing your card</p>
          </div>
        )}

        {/* RESULT */}
        {mode === "result" && result && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", gap:"16px", marginBottom:"20px", alignItems:"flex-start" }}>
              {preview && <img src={preview} alt="Card" style={{ width:"100px", borderRadius:"10px", flexShrink:0, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 4px 20px rgba(0,0,0,0.6)" }} />}
              <div style={{ flex:1 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.18)", borderRadius:"20px", marginBottom:"10px" }}>
                  <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#00ff88", display:"inline-block" }} />
                  <span style={{ fontSize:"10px", color:"#00ff88", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>Identified ✓</span>
                </div>
                <div style={{ fontFamily:"Cinzel, serif", fontSize:"18px", fontWeight:700, color:"#fff", marginBottom:"4px", lineHeight:1.2 }}>{result.name}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginBottom:"4px" }}>{result.game}</div>
                {result.confidence && (
                  <div style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.08em", color: result.confidence==="high"?"#00ff88":result.confidence==="medium"?"#ffcc00":"#ff6b6b" }}>
                    {result.confidence} confidence
                  </div>
                )}
              </div>
            </div>

            <div style={{ background:"#050515", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"4px 20px", marginBottom:"16px" }}>
              {[
                { label:"Set", value: result.set },
                { label:"Card #", value: result.number },
                { label:"Rarity", value: result.rarity },
                { label:"Condition", value: result.condition },
                { label:"Est. Price", value: result.price ? `$${result.price}` : null },
              ].filter(r=>r.value).map((row,i)=>(
                <div key={i} className="result-row">
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{row.label}</span>
                  <span style={{ fontSize:"13px", color:"#fff", fontWeight:600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {result.description && (
              <div style={{ background:"rgba(0,153,255,0.04)", border:"1px solid rgba(0,153,255,0.1)", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px", fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:1.7 }}>
                💡 {result.description}
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <button className="btn-blue" onClick={handleListCard}>🚀 List This Card on WaveTCG</button>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <button className="btn-ghost" onClick={reset}>📷 Scan Again</button>
                <button className="btn-ghost" onClick={() => { reset(); setTimeout(() => fileInputRef.current?.click(), 100); }}>🖼️ Upload Another</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
