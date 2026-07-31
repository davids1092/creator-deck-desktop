import type { Button, Workspace } from "../shared/entities";

declare global {
  interface Window {
    creatorDeck: {
      getQr(): Promise<string>;
      loadWorkspace(): Promise<Workspace>;
      saveWorkspace(workspace: Workspace): Promise<void>;
      updateButton(profileId: string, pageId: string, button: Button): Promise<void>;
      addButton(profileId: string, pageId: string): Promise<void>;
      deleteButton(profileId: string, pageId: string, buttonId: string): Promise<void>;
      addProfile(name: string): Promise<void>;
      deleteProfile(profileId: string): Promise<void>;
      onClientStatus(cb: (connected: boolean) => void): void;
      disconnectClient(): Promise<void>;
      getMediaUrl(): Promise<string>;
    };
  }
}
