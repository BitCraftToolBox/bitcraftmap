import type { AppConfig } from "$lib/types/map";
import { env } from "$env/dynamic/public";

export function createAppConfig(): AppConfig {
  return {
    gistApi: "https://api.github.com/gists/",
    exportsCdn: env.PUBLIC_EXPORTS_CDN ?? "https://exports.bitjita.com/bitcraftmap",
    relayHost: env.PUBLIC_RELAY_HOST ?? "http://localhost:3000", // STDB SDK converts this to ws/wss for us
    relayModule: env.PUBLIC_RELAY_MODULE ?? "prism-relay",
  };
}
