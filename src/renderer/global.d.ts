import type { Button, Workspace } from "../shared/entities";

declare global {
  interface Window {
    creatorDeck: {
      getQr(): Promise<string>;
      loadWorkspace(): Promise<Workspace>;
      saveWorkspace(workspace: Workspace): Promise<void>;
      updateButton(profileId: string, pageId: string, button: Button): Promise<void>;
      addButton(profileId: string, pageId: string): Promise<void>;
    };
  }
}
