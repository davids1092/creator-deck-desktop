import { exec, ChildProcess } from "child_process";
import type { Action } from "../../../shared/entities";
import type { IPlugin, PluginContext } from "./IPlugin";

const MAX_SOUND_SECONDS = 10;

export class SoundPlugin implements IPlugin {
  readonly id = "builtin.sound";
  readonly name = "Sound Player";
  readonly version = "1.0.0";

  private currentChild: ChildProcess | null = null;
  private currentResolve: (() => void) | null = null;

  stop(): void {
    if (this.currentChild) {
      this.currentChild.kill();
      this.currentChild = null;
    }
    if (this.currentResolve) {
      this.currentResolve();
      this.currentResolve = null;
    }
  }

  async execute(action: Action, _ctx: PluginContext): Promise<void> {
    this.stop();
    const uri = action.payload["uri"];
    if (typeof uri !== "string") throw new Error("SoundPlugin: missing uri.");
    const requestedVolume = action.payload["volume"];
    const volume = typeof requestedVolume === "number" && Number.isFinite(requestedVolume)
      ? Math.min(1, Math.max(0, requestedVolume))
      : 1;
    const filePath = uri.replace(/^file:\/\/\//i, "");
    const cmd =
      process.platform === "win32"
        ? `powershell -NoProfile -Command "Add-Type -AssemblyName presentationCore; $mp = New-Object System.Windows.Media.MediaPlayer; $mp.Open([System.Uri]'${filePath}'); $mp.Volume = ${volume}; $mp.Play(); Start-Sleep -s 1; while ($mp.NaturalDuration.HasTimeSpan -eq $false) { Start-Sleep -m 100 }; $dur = [Math]::Min($mp.NaturalDuration.TimeSpan.TotalSeconds, ${MAX_SOUND_SECONDS}); Start-Sleep -s $dur; $mp.Close()"`
        : process.platform === "darwin"
        ? `afplay -t ${MAX_SOUND_SECONDS} "${filePath}"`
        : `timeout ${MAX_SOUND_SECONDS} aplay "${filePath}"`;
    await new Promise<void>((res) => {
      this.currentResolve = res;
      const child: ChildProcess = exec(cmd, (e, _stdout, stderr) => {
        if (e && e.killed) { res(); return; }
        if (e) console.error("[SoundPlugin] error:", stderr);
        this.currentChild = null;
        this.currentResolve = null;
        res();
      });
      this.currentChild = child;
      setTimeout(() => { this.stop(); }, MAX_SOUND_SECONDS * 1000 + 500);
    });
  }
}
