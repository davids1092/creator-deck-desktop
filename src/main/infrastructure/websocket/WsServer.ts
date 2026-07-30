import { WebSocketServer, WebSocket } from "ws";
import type { WsEnvelope, MobileToDesktopEvent, DesktopToMobileMessage } from "../../../shared/events";
import type { Profile, Page, Button } from "../../../shared/entities";
import type { IWorkspaceRepository } from "../repositories/WorkspaceRepository";
import type { PluginManager } from "../plugins/PluginManager";

export class CreatorDeckWsServer {
  private wss: WebSocketServer | null = null;
  private client: WebSocket | null = null;

  constructor(
    private readonly port: number,
    private readonly token: string,
    private readonly repo: IWorkspaceRepository,
    private readonly plugins: PluginManager
  ) {}

  start(): void {
    this.wss = new WebSocketServer({ port: this.port });
    this.wss.on("connection", (ws) => this.handleConnection(ws));
    console.log(`WS server listening on port ${this.port}`);
  }

  stop(): void {
    this.wss?.close();
    this.wss = null;
    this.client = null;
  }

  push(message: DesktopToMobileMessage): void {
    if (!this.client || this.client.readyState !== WebSocket.OPEN) return;
    const envelope: WsEnvelope<DesktopToMobileMessage> = { token: this.token, payload: message };
    this.client.send(JSON.stringify(envelope));
  }

  async syncWorkspace(): Promise<void> {
    const workspace = await this.repo.load();
    this.push({ type: "sync.workspace", workspace });
  }

  private handleConnection(ws: WebSocket): void {
    ws.once("message", async (raw) => {
      const envelope = this.parse<MobileToDesktopEvent>(raw.toString());
      if (!envelope || envelope.token !== this.token) {
        ws.close(4001, "Unauthorized");
        return;
      }
      this.client = ws;
      ws.on("message", (data) => this.handleMessage(data.toString()));
      ws.on("close", () => { this.client = null; });

      const workspace = await this.repo.load();
      this.push({ type: "sync.workspace", workspace });
    });
  }

  private async handleMessage(raw: string): Promise<void> {
    const envelope = this.parse<MobileToDesktopEvent>(raw);
    if (!envelope) return;
    const event = envelope.payload;

    if (event.type === "button.press") {
      const workspace = await this.repo.load();
      const button = workspace.profiles
        .find((p: Profile) => p.id === event.profileId)
        ?.pages.find((pg: Page) => pg.id === event.pageId)
        ?.buttons.find((b: Button) => b.id === event.buttonId);

      if (!button) return;

      const context = {
        emitStateUpdate: (buttonId: string, stateKey: string, value: unknown) =>
          this.push({ type: "button.stateUpdate", buttonId, stateKey, value }),
        navigatePage: (pageId: string) =>
          this.push({ type: "page.navigate", pageId }),
      };

      for (const action of button.actions) {
        if (action.type === "plugin.execute") {
          await this.plugins.execute(action, context);
        }
      }
    }
  }

  private parse<T>(raw: string): WsEnvelope<T> | null {
    try { return JSON.parse(raw) as WsEnvelope<T>; }
    catch { return null; }
  }
}
