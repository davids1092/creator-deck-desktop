import { create } from "zustand";
import type { Workspace, Button } from "../../shared/entities";

interface DesktopStore {
  workspace: Workspace | null;
  qrDataUrl: string | null;
  loadWorkspace(): Promise<void>;
  generateQr(): Promise<void>;
  updateButton(profileId: string, pageId: string, button: Button): Promise<void>;
  addButton(profileId: string, pageId: string): Promise<void>;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  workspace: null,
  qrDataUrl: null,

  async loadWorkspace() {
    const workspace = await window.creatorDeck.loadWorkspace();
    set({ workspace });
  },

  async generateQr() {
    const qrDataUrl = await window.creatorDeck.getQr();
    set({ qrDataUrl });
  },

  async updateButton(profileId, pageId, button) {
    await window.creatorDeck.updateButton(profileId, pageId, button);
    const workspace = await window.creatorDeck.loadWorkspace();
    set({ workspace });
  },

  async addButton(profileId, pageId) {
    await window.creatorDeck.addButton(profileId, pageId);
    const workspace = await window.creatorDeck.loadWorkspace();
    set({ workspace });
  },
}));
