export type ActionType =
  | "sound.play"
  | "hotkey.send"
  | "plugin.execute"
  | "page.navigate"
  | "state.set";

export interface Action {
  readonly id: string;
  readonly type: ActionType;
  readonly pluginId?: string;
  readonly payload: Record<string, unknown>;
}

export interface ButtonStyle {
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly borderRadius: number;
  readonly fontSize: number;
}

export interface Button {
  readonly id: string;
  readonly label: string;
  readonly iconUri?: string;
  readonly soundUri?: string;
  /** Playback volume for this button's sound, from 0 (mute) to 1 (full). */
  readonly soundVolume?: number;
  readonly mediaUri?: string;
  readonly style: ButtonStyle;
  readonly actions: Action[];
  readonly stateKey?: string;
}

export interface Page {
  readonly id: string;
  readonly name: string;
  readonly columns: number;
  readonly rows: number;
  readonly buttons: Button[];
}

export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly pages: Page[];
  readonly defaultPageId: string;
}

export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly profiles: Profile[];
  readonly activeProfileId: string;
}
