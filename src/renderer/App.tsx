import React, { useEffect, useState } from "react";
import { useDesktopStore } from "./store/useDesktopStore";
import { PairingPanel } from "./components/PairingPanel";
import { ButtonEditor } from "./components/ButtonEditor";
import type { Button } from "../shared/entities";

type Tab = "pairing" | "workspace";

export function App() {
  const { workspace, loadWorkspace, addButton, addProfile, deleteProfile } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("pairing");
  const [editing, setEditing] = useState<{ profileId: string; pageId: string; button: Button } | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);

  useEffect(() => { loadWorkspace(); }, []);

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
      <nav style={{ width: 180, background: "#1e1e2e", padding: 16, flexShrink: 0 }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>
          🎛 Creator Deck
        </div>
        {navBtn("pairing", "📱 Pairing")}
        {navBtn("workspace", "🗂 Workspace")}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
        {tab === "pairing" && <PairingPanel />}

        {tab === "workspace" && (
          <div style={{ padding: 32 }}>
            {/* Workspace header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{workspace?.name ?? "Loading…"}</h2>
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
                <section key={page.id} style={{ marginBottom: 40, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  {/* Profile header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, color: "#374151" }}>{profile.name} › {page.name}</h3>
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
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {page.buttons.map((btn) => (
                      <div key={btn.id} style={{ position: "relative" }}>
                        <button
                          onClick={() => setEditing({ profileId: profile.id, pageId: page.id, button: btn })}
                          style={{
                            width: 110, height: 80, background: btn.style.backgroundColor,
                            color: btn.style.textColor, borderRadius: btn.style.borderRadius,
                            fontSize: btn.style.fontSize, border: "none", cursor: "pointer",
                            fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                          }}
                        >
                          {btn.iconUri && (
                            <img src={btn.iconUri} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                          )}
                          <span>{btn.label}</span>
                          {(btn.soundUri || btn.mediaUri) && (
                            <span style={{ fontSize: 10, opacity: 0.7 }}>
                              {btn.soundUri ? "🔊" : ""}{btn.mediaUri ? "🎬" : ""}
                            </span>
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Add button */}
                    <button
                      onClick={() => addButton(profile.id, page.id)}
                      style={{
                        width: 110, height: 80, background: "transparent", color: "#9ca3af",
                        borderRadius: 8, fontSize: 28, border: "2px dashed #d1d5db",
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
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
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
