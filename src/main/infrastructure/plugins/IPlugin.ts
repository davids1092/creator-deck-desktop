import type { Action } from "../../../shared/entities";

export interface PluginContext {
  emitStateUpdate(buttonId: string, stateKey: string, value: unknown): void;
  navigatePage(pageId: string): void;
}

export interface IPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  onLoad?(context: PluginContext): void | Promise<void>;
  onUnload?(): void | Promise<void>;
  execute(action: Action, context: PluginContext): Promise<void>;
}
