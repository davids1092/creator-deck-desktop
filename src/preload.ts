import { contextBridge, ipcRenderer } from "electron";
import type { Button, Workspace } from "./shared/entities";

const IPC = {
  GET_QR: "pairing:getQr",
  WORKSPACE_LOAD: "workspace:load",
  WORKSPACE_SAVE: "workspace:save",
  BUTTON_UPDATE: "button:update",
  BUTTON_ADD: "button:add",
  BUTTON_DELETE: "button:delete",
  PROFILE_ADD: "profile:add",
  PROFILE_DELETE: "profile:delete",
  CLIENT_STATUS: "client:status",
  DISCONNECT_CLIENT: "client:disconnect",
  GET_MEDIA_URL: "media:getUrl",
} as const;

contextBridge.exposeInMainWorld("creatorDeck", {
  getQr: (): Promise<string> => ipcRenderer.invoke(IPC.GET_QR),
  loadWorkspace: (): Promise<Workspace> => ipcRenderer.invoke(IPC.WORKSPACE_LOAD),
  saveWorkspace: (workspace: Workspace): Promise<void> =>
    ipcRenderer.invoke(IPC.WORKSPACE_SAVE, workspace),
  updateButton: (profileId: string, pageId: string, button: Button): Promise<void> =>
    ipcRenderer.invoke(IPC.BUTTON_UPDATE, profileId, pageId, button),
  addButton: (profileId: string, pageId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.BUTTON_ADD, profileId, pageId),
  deleteButton: (profileId: string, pageId: string, buttonId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.BUTTON_DELETE, profileId, pageId, buttonId),
  addProfile: (name: string): Promise<void> =>
    ipcRenderer.invoke(IPC.PROFILE_ADD, name),
  deleteProfile: (profileId: string): Promise<void> =>
    ipcRenderer.invoke(IPC.PROFILE_DELETE, profileId),
  onClientStatus: (cb: (connected: boolean) => void) =>
    ipcRenderer.on(IPC.CLIENT_STATUS, (_e, connected) => cb(connected)),
  disconnectClient: (): Promise<void> => ipcRenderer.invoke(IPC.DISCONNECT_CLIENT),
  getMediaUrl: (): Promise<string> => ipcRenderer.invoke(IPC.GET_MEDIA_URL),
});
