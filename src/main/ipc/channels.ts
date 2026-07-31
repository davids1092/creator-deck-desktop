export const IPC = {
  GET_QR: "pairing:getQr",
  WORKSPACE_LOAD: "workspace:load",
  WORKSPACE_SAVE: "workspace:save",
  BUTTON_UPDATE: "button:update",
  BUTTON_ADD: "button:add",
  BUTTON_DELETE: "button:delete",
  PROFILE_ADD: "profile:add",
  PROFILE_DELETE: "profile:delete",
  CLIENT_STATUS: "client:status",
  DISCONNECT_CLIENT: "client:disconnect",
  GET_MEDIA_URL: "media:getUrl",
} as const;
