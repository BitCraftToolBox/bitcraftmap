import type { AppConfig } from "$lib/types/map";
import { env } from "$env/dynamic/public";

export function createAppConfig(): AppConfig {
  return {
    backendUrl: env.PUBLIC_BACKEND_URL ?? "https://bcmap-api.bitjita.com",
    gistApi: "https://api.github.com/gists/",
    websocketUrl: env.PUBLIC_WEBSOCKET_URL ?? "wss://live.bitjita.com",
    exportsCdn: env.PUBLIC_EXPORTS_CDN ?? "https://exports.bitjita.com",
  };
}
