import React, { useState } from "react";
import type { Button } from "../../shared/entities";
import { useDesktopStore } from "../store/useDesktopStore";

interface Props {
  profileId: string;
  pageId: string;
  button: Button;
  onClose(): void;
}

export function ButtonEditor({ profileId, pageId, button, onClose }: Props) {
  const updateButton = useDesktopStore((s) => s.updateButton);
  const [label, setLabel] = useState(button.label);
  const [iconUri, setIconUri] = useState(button.iconUri ?? "");
  const [soundUri, setSoundUri] = useState(button.soundUri ?? "");
  const [bgColor, setBgColor] = useState(button.style.backgroundColor);
  const [textColor, setTextColor] = useState(button.style.textColor);

  async function handleSave() {
    await updateButton(profileId, pageId, {
      ...button,
      label,
      iconUri: iconUri || undefined,
      soundUri: soundUri || undefined,
      style: { ...button.style, backgroundColor: bgColor, textColor },
    });
    onClose();
  }

  const field: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 12 };
  const input: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", marginTop: 4 };

  return (
    <div style={{ padding: 24, minWidth: 340 }}>
      <h3 style={{ marginTop: 0 }}>Edit Button</h3>

      <div style={field}>
        <label>Label</label>
        <input style={input} value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>

      <div style={field}>
        <label>Icon URI</label>
        <input style={input} value={iconUri} onChange={(e) => setIconUri(e.target.value)} placeholder="file:///..." />
      </div>

      <div style={field}>
        <label>Sound URI</label>
        <input style={input} value={soundUri} onChange={(e) => setSoundUri(e.target.value)} placeholder="file:///..." />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div style={field}>
          <label>Background</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ marginTop: 4, height: 36, cursor: "pointer" }} />
        </div>
        <div style={field}>
          <label>Text color</label>
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ marginTop: 4, height: 36, cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>Save</button>
      </div>
    </div>
  );
}
