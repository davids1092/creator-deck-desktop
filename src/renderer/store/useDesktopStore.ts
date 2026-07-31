import { create } from "zustand";
import type { Workspace, Button } from "../../shared/entities";

interface DesktopStore {
  workspace: Workspace | null;
  qrDataUrl: string | null;
  isConnected: boolean;
  loadWorkspace(): Promise<void>;
  generateQr(): Promise<void>;
  setConnected(v: boolean): void;
  disconnectClient(): Promise<void>;
  updateButton(profileId: string, pageId: string, button: Button): Promise<void>;
  addButton(profileId: string, pageId: string): Promise<void>;
  deleteButton(profileId: string, pageId: string, buttonId: string): Promise<void>;
  addProfile(name: string): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
}

async function reload(set: (s: Partial<DesktopStore>) => void) {
  const workspace = await window.creatorDeck.loadWorkspace();
  set({ workspace });
}

export const useDesktopStore = create<DesktopStore>((set) => {
  window.creatorDeck.onClientStatus((connected) => {
    useDesktopStore.getState().setConnected(connected);
  });

  return {
  workspace: null,
  qrDataUrl: null,
  isConnected: false,

  async loadWorkspace() { await reload(set); },

  async generateQr() {
    const qrDataUrl = await window.creatorDeck.getQr();
    set({ qrDataUrl });
  },

  setConnected(v) { set({ isConnected: v }); },

  async disconnectClient() {
    await window.creatorDeck.disconnectClient();
  },

  async updateButton(profileId, pageId, button) {
    await window.creatorDeck.updateButton(profileId, pageId, button);
    await reload(set);
  },

  async addButton(profileId, pageId) {
    await window.creatorDeck.addButton(profileId, pageId);
    await reload(set);
  },

  async deleteButton(profileId, pageId, buttonId) {
    await window.creatorDeck.deleteButton(profileId, pageId, buttonId);
    await reload(set);
  },

  async addProfile(name) {
    await window.creatorDeck.addProfile(name);
    await reload(set);
  },

  async deleteProfile(profileId) {
    await window.creatorDeck.deleteProfile(profileId);
    await reload(set);
  },
  };
});
