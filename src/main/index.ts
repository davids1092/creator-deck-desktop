import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { JsonWorkspaceRepository } from "./infrastructure/repositories/WorkspaceRepository";
import { PluginManager } from "./infrastructure/plugins/PluginManager";
import { SoundPlugin } from "./infrastructure/plugins/SoundPlugin";
import { CreatorDeckWsServer } from "./infrastructure/websocket/WsServer";
import { generatePairingSession } from "./infrastructure/websocket/QrPairing";
import { IPC } from "./ipc/channels";
import type { Button, Profile, Page } from "../shared/entities";

const WS_PORT = 49152;
let wsServer: CreatorDeckWsServer | null = null;
let repo: JsonWorkspaceRepository;
const pluginManager = new PluginManager();

app.whenReady().then(async () => {
  const dataDir = path.join(app.getPath("userData"), "creator-deck");
  repo = new JsonWorkspaceRepository(dataDir);

  const dummyCtx = { emitStateUpdate: () => {}, navigatePage: () => {} };
  await pluginManager.register(new SoundPlugin(), dummyCtx);

  registerIpcHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  wsServer?.stop();
  if (process.platform !== "darwin") app.quit();
});

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
    },
  });
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC.GET_QR, async () => {
    const session = await generatePairingSession(WS_PORT);
    wsServer?.stop();
    wsServer = new CreatorDeckWsServer(WS_PORT, session.payload.token, repo, pluginManager);
    wsServer.start();
    return session.qrDataUrl;
  });

  ipcMain.handle(IPC.WORKSPACE_LOAD, () => repo.load());

  ipcMain.handle(IPC.WORKSPACE_SAVE, (_e, workspace) => repo.save(workspace));

  ipcMain.handle(IPC.BUTTON_UPDATE, async (_e, profileId: string, pageId: string, button: Button) => {
    const workspace = await repo.load();
    const profiles = workspace.profiles.map((p: Profile) => {
      if (p.id !== profileId) return p;
      const pages = p.pages.map((pg: Page) => {
        if (pg.id !== pageId) return pg;
        return { ...pg, buttons: pg.buttons.map((b: Button) => (b.id === button.id ? button : b)) };
      });
      return { ...p, pages };
    });
    await repo.save({ ...workspace, profiles });
    wsServer?.syncWorkspace();
  });

  ipcMain.handle(IPC.BUTTON_ADD, async (_e, profileId: string, pageId: string) => {
    const workspace = await repo.load();
    const newButton: Button = {
      id: uuidv4(),
      label: "New Button",
      style: { backgroundColor: "#6b7280", textColor: "#fff", borderRadius: 8, fontSize: 14 },
      actions: [],
    };
    const profiles = workspace.profiles.map((p: Profile) => {
      if (p.id !== profileId) return p;
      const pages = p.pages.map((pg: Page) => {
        if (pg.id !== pageId) return pg;
        return { ...pg, buttons: [...pg.buttons, newButton] };
      });
      return { ...p, pages };
    });
    await repo.save({ ...workspace, profiles });
    wsServer?.syncWorkspace();
  });

  ipcMain.handle(IPC.BUTTON_DELETE, async (_e, profileId: string, pageId: string, buttonId: string) => {
    const workspace = await repo.load();
    const profiles = workspace.profiles.map((p: Profile) => {
      if (p.id !== profileId) return p;
      const pages = p.pages.map((pg: Page) => {
        if (pg.id !== pageId) return pg;
        return { ...pg, buttons: pg.buttons.filter((b: Button) => b.id !== buttonId) };
      });
      return { ...p, pages };
    });
    await repo.save({ ...workspace, profiles });
    wsServer?.syncWorkspace();
  });

  ipcMain.handle(IPC.PROFILE_ADD, async (_e, name: string) => {
    const workspace = await repo.load();
    const pageId = uuidv4();
    const newProfile: Profile = {
      id: uuidv4(),
      name,
      defaultPageId: pageId,
      pages: [
        {
          id: pageId,
          name: "Main",
          columns: 3,
          rows: 2,
          buttons: [],
        },
      ],
    };
    await repo.save({ ...workspace, profiles: [...workspace.profiles, newProfile] });
    wsServer?.syncWorkspace();
  });

  ipcMain.handle(IPC.PROFILE_DELETE, async (_e, profileId: string) => {
    const workspace = await repo.load();
    const profiles = workspace.profiles.filter((p: Profile) => p.id !== profileId);
    const activeProfileId =
      workspace.activeProfileId === profileId
        ? (profiles[0]?.id ?? "")
        : workspace.activeProfileId;
    await repo.save({ ...workspace, profiles, activeProfileId });
    wsServer?.syncWorkspace();
  });
}
