import React, { useState, useRef } from "react";
import type { Button } from "../../shared/entities";
import { useDesktopStore } from "../store/useDesktopStore";

interface Props {
  profileId: string;
  pageId: string;
  button: Button;
  onClose(): void;
}

type Tab = "general" | "media" | "sound";

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange(v: string): void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" as const }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 36, height: 36, borderRadius: 8, background: value,
            border: "2px solid rgba(255,255,255,0.15)", cursor: "pointer", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          style={{
            width: 90, padding: "7px 8px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", background: "#1e1e2e",
            color: "#e5e7eb", fontSize: 12, fontFamily: "monospace", outline: "none",
          }}
        />
      </div>
    </div>
  );
}

export function ButtonEditor({ profileId, pageId, button, onClose }: Props) {
  const { updateButton, deleteButton } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("general");

  // Local state — nothing persists until handleSave
  const [label, setLabel] = useState(button.label);
  const [iconUri, setIconUri] = useState(button.iconUri ?? "");
  const [bgColor, setBgColor] = useState(button.style.backgroundColor);
  const [textColor, setTextColor] = useState(
    button.style.textColor === "#fff" ? "#ffffff" : button.style.textColor
  );
  const [soundUri, setSoundUri] = useState(button.soundUri ?? "");
  const [soundVolume, setSoundVolume] = useState(button.soundVolume ?? 1);
  const [mediaUri, setMediaUri] = useState(button.mediaUri ?? "");

  async function handleSave() {
    await updateButton(profileId, pageId, {
      ...button, label,
      iconUri: iconUri || undefined,
      soundUri: soundUri || undefined,
      soundVolume: soundUri ? soundVolume : undefined,
      mediaUri: mediaUri || undefined,
      style: { ...button.style, backgroundColor: bgColor, textColor },
    });
    onClose();
  }

  function handleCancel() {
    onClose();
  }

  async function handleDelete() {
    await deleteButton(profileId, pageId, button.id);
    onClose();
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
    fontWeight: 600, letterSpacing: 0.3,
    background: tab === t ? "#7c3aed" : "rgba(255,255,255,0.06)",
    color: tab === t ? "#fff" : "#9ca3af",
    boxShadow: tab === t ? "0 2px 8px rgba(124,58,237,0.4)" : "none",
    transition: "all 150ms ease",
  });

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, color: "#9ca3af", fontWeight: 600,
    letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)", background: "#1e1e2e",
    color: "#e5e7eb", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
  };

  const fileHint: React.CSSProperties = { fontSize: 11, color: "#6b7280", marginTop: 6, lineHeight: 1.5 };

  const deleteBtn: React.CSSProperties = {
    marginTop: 6, background: "rgba(220,38,38,0.15)", color: "#f87171",
    border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6,
    padding: "3px 10px", cursor: "pointer", fontSize: 12,
  };

  return (
    <div style={{ padding: 24, width: 380, background: "#13131f", borderRadius: 16, color: "#e5e7eb", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f3f4f6" }}>Editar botón</span>
        <button onClick={handleDelete}
          style={{ background: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          🗑 Eliminar
        </button>
      </div>

      {/* Preview — uses local state, not persisted yet */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 10,
          background: `linear-gradient(160deg, color-mix(in srgb, ${bgColor} 75%, white 25%) 0%, ${bgColor} 100%)`,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8,
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" }} />
          {iconUri && <img src={iconUri} style={{ position: "absolute", width: "85%", height: "85%", top: "7.5%", objectFit: "cover", borderRadius: 8 }} />}
          <span style={{ position: "relative", color: textColor, fontWeight: 700, fontSize: 13, textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.8)", maxWidth: "90%" }}>
            {label || "…"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
        <button style={tabStyle("general")} onClick={() => setTab("general")}>General</button>
        <button style={tabStyle("sound")} onClick={() => setTab("sound")}>🔊 Sonido</button>
        <button style={tabStyle("media")} onClick={() => setTab("media")}>🎬 Media</button>
      </div>

      {tab === "general" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={fieldLabel}>Nombre</div>
            <input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nombre del botón" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={fieldLabel}>Icono</div>
            <label style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)",
              cursor: "pointer", color: "#9ca3af", fontSize: 13,
            }}>
              <span>📁</span>
              <span>{iconUri ? "Cambiar imagen" : "Seleccionar imagen"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setIconUri(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {iconUri && (
              <button onClick={() => setIconUri("")} style={deleteBtn}>
                🗑 Eliminar icono
              </button>
            )}
          </div>

          {/* Colors — stacked vertically to avoid overflow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ColorPicker label="Color de fondo" value={bgColor} onChange={setBgColor} />
            <ColorPicker label="Color de texto" value={textColor} onChange={setTextColor} />
          </div>
        </>
      )}

      {tab === "sound" && (
        <div>
          <div style={fieldLabel}>Archivo de sonido</div>
          <label style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)",
            cursor: "pointer", color: "#9ca3af", fontSize: 13,
          }}>
            <span>🎵</span>
            <span>{soundUri ? "Cambiar sonido" : "Seleccionar sonido"}</span>
            <input type="file" accept="audio/*" style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSoundUri(`file:///${file.path ?? file.name}`);
              }}
            />
          </label>
          {soundUri && (
            <>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, wordBreak: "break-all" }}>{soundUri}</div>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={fieldLabel}>Volumen</div>
                  <span style={{ fontSize: 12, color: "#c4b5fd", fontWeight: 700 }}>{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  aria-label="Volumen del sonido"
                  style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }}
                />
              </div>
              <button onClick={() => setSoundUri("")} style={deleteBtn}>🗑 Eliminar sonido</button>
            </>
          )}
          <p style={fileHint}>Soporta .mp3, .wav, .ogg — máx. 10 segundos de reproducción.</p>
        </div>
      )}

      {tab === "media" && (
        <div>
          <div style={fieldLabel}>GIF o Video</div>
          <label style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)",
            cursor: "pointer", color: "#9ca3af", fontSize: 13,
          }}>
            <span>🎬</span>
            <span>{mediaUri ? "Cambiar media" : "Seleccionar media"}</span>
            <input type="file" accept="video/*,image/gif" style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setMediaUri(`file:///${file.path ?? file.name}`);
              }}
            />
          </label>
          {mediaUri && (
            <>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, wordBreak: "break-all" }}>{mediaUri}</div>
              <button onClick={() => setMediaUri("")} style={deleteBtn}>🗑 Eliminar video</button>
            </>
          )}
          <p style={fileHint}>Soporta .gif, .mp4, .webm — máx. 20 segundos de reproducción.</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={handleCancel} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 2px 8px rgba(124,58,237,0.4)" }}>
          Guardar
        </button>
      </div>
    </div>
  );
}
