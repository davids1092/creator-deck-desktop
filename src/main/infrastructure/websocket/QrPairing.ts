import QRCode from "qrcode";
import { networkInterfaces } from "os";
import { v4 as uuidv4 } from "uuid";
import type { PairingPayload } from "../../../shared/protocols/pairing";

export interface PairingSession {
  payload: PairingPayload;
  qrDataUrl: string;
}

function getLocalIp(): string {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

export async function generatePairingSession(port: number): Promise<PairingSession> {
  const payload: PairingPayload = { host: getLocalIp(), port, token: uuidv4() };
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload));
  return { payload, qrDataUrl };
}
