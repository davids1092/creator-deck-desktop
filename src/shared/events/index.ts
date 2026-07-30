import type { Workspace } from "../entities";

export interface ButtonPressEvent {
  readonly type: "button.press";
  readonly buttonId: string;
  readonly pageId: string;
  readonly profileId: string;
}

export interface ClientReadyEvent {
  readonly type: "client.ready";
}

export type MobileToDesktopEvent = ButtonPressEvent | ClientReadyEvent;

export interface SyncWorkspaceMessage {
  readonly type: "sync.workspace";
  readonly workspace: Workspace;
}

export interface ButtonStateUpdateMessage {
  readonly type: "button.stateUpdate";
  readonly buttonId: string;
  readonly stateKey: string;
  readonly value: unknown;
}

export interface NavigatePageMessage {
  readonly type: "page.navigate";
  readonly pageId: string;
}

export type DesktopToMobileMessage =
  | SyncWorkspaceMessage
  | ButtonStateUpdateMessage
  | NavigatePageMessage;

export interface WsEnvelope<T> {
  readonly token: string;
  readonly payload: T;
}
