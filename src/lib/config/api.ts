import type { AppConfig } from "$lib/types/map";
import * as env from "$env/static/public";

export function createAppConfig(): AppConfig {
  return {
    gistApi: "https://api.github.com/gists/",
    exportsCdn: env.PUBLIC_EXPORTS_CDN ?? "https://prism.brico.app",
    relayHost: env.PUBLIC_RELAY_HOST ?? "https://st.prism.brico.app", // STDB SDK converts this to ws/wss for us
    relayModule: env.PUBLIC_RELAY_MODULE ?? "prism-relay",
  };
}
