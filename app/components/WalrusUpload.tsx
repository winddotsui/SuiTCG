"use client";
import { useState } from "react";

const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

export default function WalrusUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress("Uploading to Walrus...");

    try {
      const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=5`, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      
      let blobId = "";
      if (data.newlyCreated) {
        blobId = data.newlyCreated.blobObject.blobId;
      } else if (data.alreadyCertified) {
        blobId = data.alreadyCertified.blobId;
      }

      if (!blobId) throw new Error("No blob ID received");

      const imageUrl = `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
      setProgress("✅ Uploaded to Walrus!");
      onUpload(imageUrl);
    } catch (err: any) {
      setProgress("❌ Upload failed: " + err.message);
      console.error(err);
    }

    setUploading(false);
  }

  return (
    <div>
      <label style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "12px",
        border: "2px dashed rgba(255,255,255,0.12)",
        borderRadius: "12px", padding: "24px",
        cursor: "pointer", transition: "border-color 0.2s",
        background: "#18181f",
      }}>
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
        ) : (
          <>
            <div style={{ fontSize: "32px" }}>📸</div>
            <div style={{ fontSize: "13px", color: "#888898", textAlign: "center" }}>
              Click to upload card image<br />
              <span style={{ fontSize: "11px", color: "#555562" }}>Stored on Sui Walrus · Permanent · Decentralized</span>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {progress && (
        <div style={{
          marginTop: "8px", fontSize: "12px",
          color: progress.includes("✅") ? "#4caf7d" : progress.includes("❌") ? "#e05555" : "#4da2ff",
          textAlign: "center",
        }}>
          {uploading && <span>⏳ </span>}
          {progress}
        </div>
      )}

      {progress.includes("✅") && (
        <div style={{
          marginTop: "8px", padding: "8px 12px",
          background: "rgba(77,162,255,0.05)",
          border: "1px solid rgba(77,162,255,0.15)",
          borderRadius: "8px", fontSize: "11px", color: "#4da2ff",
          textAlign: "center",
        }}>
          ◈ Image stored on Sui Walrus blockchain
        </div>
      )}
    </div>
  );
}
