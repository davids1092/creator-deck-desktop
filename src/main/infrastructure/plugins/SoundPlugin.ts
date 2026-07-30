import { exec } from "child_process";
import type { Action } from "../../../shared/entities";
import type { IPlugin, PluginContext } from "./IPlugin";

export class SoundPlugin implements IPlugin {
  readonly id = "builtin.sound";
  readonly name = "Sound Player";
  readonly version = "1.0.0";

  async execute(action: Action, _ctx: PluginContext): Promise<void> {
    const uri = action.payload["uri"];
    if (typeof uri !== "string") throw new Error("SoundPlugin: missing uri.");
    const cmd =
      process.platform === "win32"
        ? `powershell -c (New-Object Media.SoundPlayer '${uri}').PlaySync()`
        : process.platform === "darwin"
        ? `afplay "${uri}"`
        : `aplay "${uri}"`;
    await new Promise<void>((res, rej) => exec(cmd, (e) => (e ? rej(e) : res())));
  }
}
