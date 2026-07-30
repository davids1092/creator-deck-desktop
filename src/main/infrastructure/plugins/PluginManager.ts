import type { Action } from "../../../shared/entities";
import type { IPlugin, PluginContext } from "./IPlugin";

export class PluginManager {
  private readonly plugins = new Map<string, IPlugin>();

  async register(plugin: IPlugin, context: PluginContext): Promise<void> {
    await plugin.onLoad?.(context);
    this.plugins.set(plugin.id, plugin);
  }

  async execute(action: Action, context: PluginContext): Promise<void> {
    if (!action.pluginId) throw new Error("Action has no pluginId.");
    const plugin = this.plugins.get(action.pluginId);
    if (!plugin) throw new Error(`Plugin "${action.pluginId}" not found.`);
    await plugin.execute(action, context);
  }

  list(): IPlugin[] {
    return Array.from(this.plugins.values());
  }
}
