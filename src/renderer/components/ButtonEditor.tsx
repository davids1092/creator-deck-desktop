import React, { useState } from "react";
import type { Button } from "../../shared/entities";
import { useDesktopStore } from "../store/useDesktopStore";

interface Props {
  profileId: string;
  pageId: string;
  button: Button;
  onClose(): void;
}

type Tab = "general" | "media" | "sound";

export function ButtonEditor({ profileId, pageId, button, onClose }: Props) {
  const { updateButton, deleteButton } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("general");
  const [label, setLabel] = useState(button.label);
  const [iconUri, setIconUri] = useState(button.iconUri ?? "");
  const [bgColor, setBgColor] = useState(button.style.backgroundColor);
  const [textColor, setTextColor] = useState(button.style.textColor);
  const [soundUri, setSoundUri] = useState(button.soundUri ?? "");
  const [mediaUri, setMediaUri] = useState(button.mediaUri ?? "");

  async function handleSave() {
    await updateButton(profileId, pageId, {
      ...button,
      label,
      iconUri: iconUri || undefined,
      soundUri: soundUri || undefined,
      mediaUri: mediaUri || undefined,
      style: { ...button.style, backgroundColor: bgColor, textColor },
    });
    onClose();
  }

  async function handleDelete() {
    await deleteButton(profileId, pageId, button.id);
    onClose();
  }

  const field: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 16 };
  const input: React.CSSProperties = {
    padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb",
    marginTop: 4, fontSize: 13, outline: "none",
  };
  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13,
    background: tab === t ? "#7c3aed" : "#f3f4f6",
    color: tab === t ? "#fff" : "#374151",
    fontWeight: tab === t ? 600 : 400,
  });

  return (
    <div style={{ padding: 24, width: 380 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Editar botón</h3>
        <button
          onClick={handleDelete}
          style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
        >
          🗑 Eliminar
        </button>
      </div>

      {/* Preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          width: 100, height: 70, borderRadius: 8, background: bgColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: textColor, fontWeight: 600, fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {label || "…"}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <button style={tabStyle("general")} onClick={() => setTab("general")}>General</button>
        <button style={tabStyle("sound")} onClick={() => setTab("sound")}>🔊 Sonido</button>
        <button style={tabStyle("media")} onClick={() => setTab("media")}>🎬 Media</button>
      </div>

      {tab === "general" && (
        <>
          <div style={field}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Nombre</label>
            <input style={input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nombre del botón" />
          </div>
          <div style={field}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Icono</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setIconUri(`file:///${file.path ?? file.name}`);
              }}
              style={{ marginTop: 4, fontSize: 13, color: "#374151" }}
            />
            {iconUri && <span style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{iconUri}</span>}
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={field}>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Color de fondo</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                style={{ marginTop: 4, height: 38, width: 80, cursor: "pointer", border: "1px solid #e5e7eb", borderRadius: 6 }} />
            </div>
            <div style={field}>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Color de texto</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                style={{ marginTop: 4, height: 38, width: 80, cursor: "pointer", border: "1px solid #e5e7eb", borderRadius: 6 }} />
            </div>
          </div>
        </>
      )}

      {tab === "sound" && (
        <div style={field}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Archivo de sonido</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSoundUri(`file:///${file.path ?? file.name}`);
            }}
            style={{ marginTop: 4, fontSize: 13, color: "#374151" }}
          />
          {soundUri && <span style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{soundUri}</span>}
          <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            Soporta .mp3, .wav, .ogg. Al presionar el botón en el mobile se reproducirá este sonido.
          </span>
        </div>
      )}

      {tab === "media" && (
        <div style={field}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>GIF o Video</label>
          <input
            type="file"
            accept="video/*,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setMediaUri(`file:///${file.path ?? file.name}`);
            }}
            style={{ marginTop: 4, fontSize: 13, color: "#374151" }}
          />
          {mediaUri && <span style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{mediaUri}</span>}
          <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            Soporta .gif, .mp4, .webm. Se mostrará en el mobile al presionar el botón.
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13 }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          Guardar
        </button>
      </div>
    </div>
  );
}
