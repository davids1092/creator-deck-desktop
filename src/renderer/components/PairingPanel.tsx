import React, { useEffect } from "react";
import { useDesktopStore } from "../store/useDesktopStore";

export function PairingPanel() {
  const { qrDataUrl, generateQr } = useDesktopStore();

  useEffect(() => { generateQr(); }, []);

  return (
    <div style={{ textAlign: "center", padding: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Connect Mobile Device</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Open Creator Deck on your phone and scan this QR code.
      </p>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="Pairing QR" width={240} height={240} style={{ borderRadius: 8 }} />
      ) : (
        <p>Generating QR…</p>
      )}
      <br />
      <button
        onClick={generateQr}
        style={{ marginTop: 16, padding: "8px 20px", cursor: "pointer", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff" }}
      >
        Regenerate
      </button>
    </div>
  );
}
