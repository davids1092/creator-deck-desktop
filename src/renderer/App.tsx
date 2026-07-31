import React, { useEffect, useState } from "react";
import { useDesktopStore } from "./store/useDesktopStore";
import { PairingPanel } from "./components/PairingPanel";
import { ButtonEditor } from "./components/ButtonEditor";
import type { Button } from "../shared/entities";

type Tab = "pairing" | "workspace";

export function App() {
  const { workspace, loadWorkspace, addButton, addProfile, deleteProfile, isConnected } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("pairing");
  const [editing, setEditing] = useState<{ profileId: string; pageId: string; button: Button } | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWorkspace();
    window.creatorDeck.getMediaUrl().then(setMediaUrl);
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(mediaUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAddProfile() {
    const name = newProfileName.trim();
    if (!name) return;
    await addProfile(name);
    setNewProfileName("");
    setShowNewProfile(false);
  }

  const navBtn = (t: Tab, label: string) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      style={{
        display: "block", width: "100%", marginBottom: 8, textAlign: "left",
        padding: "10px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        background: tab === t ? "#7c3aed" : "transparent", color: "#fff", fontSize: 14,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <nav style={{ width: 180, background: "#1e1e2e", padding: 16, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>
          🎛 Creator Deck
        </div>
        {navBtn("pairing", "📱 Pairing")}
        {navBtn("workspace", "🗂 Workspace")}

          {/* Connection status */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #2d2d3f", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* OBS URL */}
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🎬</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: 0.5 }}>OBS BROWSER SOURCE</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <code style={{ flex: 1, fontSize: 9, color: "#34d399", background: "#0f0f1a", borderRadius: 6, padding: "4px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {mediaUrl}
              </code>
              <button
                onClick={handleCopy}
                title="Copiar URL"
                style={{ flexShrink: 0, padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, background: copied ? "#059669" : "#7c3aed", color: "#fff", fontWeight: 600 }}
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
          </div>

          {/* Device status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: isConnected ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
            border: `1px solid ${isConnected ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.2)"}`,
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>{isConnected ? "📲" : "📵"}</span>
              <div style={{
                position: "absolute", bottom: 0, right: -2,
                width: 8, height: 8, borderRadius: "50%",
                background: isConnected ? "#22c55e" : "#6b7280",
                boxShadow: isConnected ? "0 0 6px #22c55e" : "none",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: isConnected ? "#4ade80" : "#9ca3af", letterSpacing: 0.5 }}>
                {isConnected ? "ENLAZADO" : "SIN ENLACE"}
              </div>
              <div style={{ fontSize: 10, color: isConnected ? "#86efac" : "#6b7280", marginTop: 1 }}>
                {isConnected ? "Mobile conectado" : "Esperando dispositivo"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", background: "#0f0f1a" }}>
        {tab === "pairing" && <PairingPanel />}

        {tab === "workspace" && (
          <div style={{ padding: 32, background: "#0f0f1a", minHeight: "100%" }}>
            {/* Workspace header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, color: "#e5e7eb" }}>{workspace?.name ?? "Loading…"}</h2>
              <button
                onClick={() => setShowNewProfile(true)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                + Nuevo perfil
              </button>
            </div>

            {/* New profile input */}
            {showNewProfile && (
              <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
                <input
                  autoFocus
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddProfile(); if (e.key === "Escape") setShowNewProfile(false); }}
                  placeholder="Nombre del perfil"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", width: 220 }}
                />
                <button onClick={handleAddProfile} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 13 }}>
                  Crear
                </button>
                <button onClick={() => setShowNewProfile(false)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                  Cancelar
                </button>
              </div>
            )}

            {/* Profiles */}
            {workspace?.profiles.map((profile) =>
              profile.pages.map((page) => (
                <section key={page.id} style={{ marginBottom: 40, background: "#1a1a2e", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)", border: "1px solid #2a2a3f" }}>
                  {/* Profile header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, color: "#a78bfa" }}>{profile.name} › {page.name}</h3>
                    {workspace.profiles.length > 1 && (
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
                      >
                        🗑 Eliminar perfil
                      </button>
                    )}
                  </div>

                  {/* Buttons grid */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {page.buttons.map((btn) => (
                      <div key={btn.id}
                        style={{
                          // outer shell
                          background: "#111118",
                          borderRadius: Math.min(btn.style.borderRadius, 10) + 2,
                          border: "1.5px solid #2a2a3a",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)",
                          padding: "0 0 4px 0",
                          cursor: "pointer",
                          transition: "transform 60ms ease, box-shadow 60ms ease",
                        }}
                        onMouseDown={(e) => {
                          const el = e.currentTarget;
                          el.style.transform = "translateY(3px)";
                          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.7)";
                        }}
                        onMouseUp={(e) => {
                          const el = e.currentTarget;
                          el.style.transform = "";
                          el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)";
                          setEditing({ profileId: profile.id, pageId: page.id, button: btn });
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.transform = "";
                          el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)";
                        }}
                      >
                        {/* Face */}
                        <div style={{
                          width: 96, height: 96,
                          background: `linear-gradient(160deg, color-mix(in srgb, ${btn.style.backgroundColor} 75%, white 25%) 0%, ${btn.style.backgroundColor} 100%)`,
                          borderRadius: Math.min(btn.style.borderRadius, 10),
                          border: "1px solid rgba(255,255,255,0.12)",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          position: "relative", overflow: "hidden",
                        }}>
                          {/* Gloss */}
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                            pointerEvents: "none",
                          }} />
                          {btn.iconUri && (
                            <img src={btn.iconUri} alt="" style={{
                              position: "absolute", width: "85%", height: "85%",
                              top: "7.5%", objectFit: "cover",
                              borderRadius: Math.min(btn.style.borderRadius, 8) - 2,
                            }} />
                          )}
                          <span style={{
                            position: "relative",
                            color: btn.style.textColor,
                            fontSize: btn.style.fontSize, fontWeight: 700,
                            textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                            lineHeight: 1.2,
                          }}>{btn.label}</span>
                          {(btn.soundUri || btn.mediaUri) && (
                            <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 11, opacity: 0.8 }}>
                              {btn.soundUri ? "🔊" : ""}{btn.mediaUri ? "🎬" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add button */}
                    <button
                      onClick={() => addButton(profile.id, page.id)}
                      style={{
                        width: 100, height: 100, background: "transparent", color: "#4b5563",
                        borderRadius: 10, fontSize: 28, border: "2px dashed #2a2a3f",
                        cursor: "pointer", fontWeight: 300,
                      }}
                    >
                      +
                    </button>
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}>
            <ButtonEditor
              profileId={editing.profileId}
              pageId={editing.pageId}
              button={editing.button}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
