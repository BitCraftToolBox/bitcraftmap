import type { AppConfig } from '$lib/types/map';

export function createAppConfig(): AppConfig {
	return {
		backendUrl: import.meta.env.PUBLIC_BACKEND_URL ?? 'https://bcmap-api.bitjita.com',
		gistApi: 'https://api.github.com/gists/',
		websocketUrl: import.meta.env.PUBLIC_WEBSOCKET_URL ?? 'wss://live.bitjita.com',
		exportsCdn: import.meta.env.PUBLIC_EXPORTS_CDN ?? 'https://exports.bitjita.com'
	};
}
