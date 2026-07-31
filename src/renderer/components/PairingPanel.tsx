import React, { useEffect } from "react";
import { useDesktopStore } from "../store/useDesktopStore";

export function PairingPanel() {
  const { qrDataUrl, generateQr, isConnected, disconnectClient } = useDesktopStore();

  useEffect(() => { generateQr(); }, []);

  if (isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #059669, #34d399)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px rgba(52,211,153,0.4)",
          fontSize: 36,
        }}>
          📱
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#059669" }}>Dispositivo enlazado</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>El mobile está conectado y listo</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 16px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>En línea</span>
        </div>
        <button
          onClick={disconnectClient}
          style={{ marginTop: 8, padding: "8px 20px", cursor: "pointer", borderRadius: 6, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 13, fontWeight: 600 }}
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Conectar dispositivo móvil</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Abre Creator Deck en tu teléfono y escanea este código QR.
      </p>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="Pairing QR" width={240} height={240} style={{ borderRadius: 8 }} />
      ) : (
        <p>Generando QR…</p>
      )}
      <br />
      <button
        onClick={generateQr}
        style={{ marginTop: 16, padding: "8px 20px", cursor: "pointer", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff" }}
      >
        Regenerar
      </button>
    </div>
  );
}
