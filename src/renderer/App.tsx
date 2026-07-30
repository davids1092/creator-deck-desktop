import React, { useEffect, useState } from "react";
import { useDesktopStore } from "./store/useDesktopStore";
import { PairingPanel } from "./components/PairingPanel";
import { ButtonEditor } from "./components/ButtonEditor";
import type { Button } from "../shared/entities";

type Tab = "pairing" | "workspace";

export function App() {
  const { workspace, loadWorkspace, addButton } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("pairing");
  const [editing, setEditing] = useState<{ profileId: string; pageId: string; button: Button } | null>(null);

  useEffect(() => { loadWorkspace(); }, []);

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
            <h2 style={{ marginTop: 0 }}>{workspace?.name ?? "Loading…"}</h2>
            {workspace?.profiles.map((profile) =>
              profile.pages.map((page) => (
                <section key={page.id} style={{ marginBottom: 32 }}>
                  <h3 style={{ color: "#374151" }}>{profile.name} › {page.name}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${page.columns}, 120px)`, gap: 10 }}>
                    {page.buttons.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setEditing({ profileId: profile.id, pageId: page.id, button: btn })}
                        style={{
                          height: 80, background: btn.style.backgroundColor,
                          color: btn.style.textColor, borderRadius: btn.style.borderRadius,
                          fontSize: btn.style.fontSize, border: "none", cursor: "pointer",
                          fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={() => addButton(profile.id, page.id)}
                      style={{
                        height: 80, background: "transparent", color: "#9ca3af",
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
