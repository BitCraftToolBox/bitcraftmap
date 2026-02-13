import { createAppConfig } from '$lib/config/api';

export interface PlayerState {
	entity_id: string;
	location_x: number;
	location_z: number;
	destination_x: number;
	destination_z: number;
}

export type PlayerUpdateCallback = (state: PlayerState) => void;

export function connectWebSocket(
	playerIds: string[],
	onUpdate: PlayerUpdateCallback,
	onConnect?: () => void
): WebSocket | null {
	if (playerIds.length === 0) return null;

	const validPlayerIds = playerIds.filter((id) => /^[0-9]{1,32}$/.test(id));
	if (validPlayerIds.length === 0) return null;

	const config = createAppConfig();
	const channels = validPlayerIds.map((id) => `mobile_entity_state:${id}`);
	const subscribeMsg = { type: 'subscribe', channels };

	const ws = new WebSocket(config.websocketUrl);

	ws.onopen = () => {
		console.log('WebSocket connected');
		ws.send(JSON.stringify(subscribeMsg));
		onConnect?.();
	};

	ws.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		if (msg?.type === 'event' && msg.channel) {
			const channelPlayerId = msg.channel.split(':')[1];
			if (validPlayerIds.includes(channelPlayerId)) {
				onUpdate(msg.data);
			}
		}
	};

	ws.onerror = (error) => console.error('WebSocket error:', error);
	ws.onclose = () => console.log('WebSocket closed');

	return ws;
}
