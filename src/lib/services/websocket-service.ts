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
		try {
			const msg = JSON.parse(event.data);
			if (msg?.type === 'event' && msg.channel) {
				const channelPlayerId = msg.channel.split(':')[1];
				if (validPlayerIds.includes(channelPlayerId)) {
					const data = msg.data;
					if (data?.entity_id && typeof data.location_x === 'number' && typeof data.location_z === 'number') {
						onUpdate(data);
					}
				}
			}
		} catch (err) {
			console.error('WebSocket message parse error:', err);
		}
	};

	ws.onerror = (error) => console.error('WebSocket error:', error);
	ws.onclose = () => console.log('WebSocket closed');

	return ws;
}

// --- Resource state WebSocket ---

export interface ResourceEvent {
	event_type: 'insert' | 'delete';
	region_id: string;
	timestamp: number;
	entity_id: string;
	resource_id: number;
	direction_index: number;
}

export type ResourceEventCallback = (event: ResourceEvent) => void;

let resourceWs: WebSocket | null = null;
let resourceCallback: ResourceEventCallback | null = null;
const subscribedResourceChannels = new Set<string>();

export function setResourceEventCallback(cb: ResourceEventCallback): void {
	resourceCallback = cb;
}

export function subscribeResource(resourceId: number): void {
	const channel = `resource_state:resource_id:${resourceId}`;
	if (subscribedResourceChannels.has(channel)) return;
	subscribedResourceChannels.add(channel);

	if (!resourceWs || resourceWs.readyState !== WebSocket.OPEN) {
		resourceWs = createResourceWebSocket();
	} else {
		resourceWs.send(JSON.stringify({ type: 'subscribe', channels: [channel] }));
	}
}

export function unsubscribeResource(resourceId: number): void {
	const channel = `resource_state:resource_id:${resourceId}`;
	subscribedResourceChannels.delete(channel);

	if (resourceWs?.readyState === WebSocket.OPEN) {
		resourceWs.send(JSON.stringify({ type: 'unsubscribe', channels: [channel] }));
	}

	if (subscribedResourceChannels.size === 0 && resourceWs) {
		resourceWs.close();
		resourceWs = null;
	}
}

export function closeResourceWebSocket(): void {
	if (resourceWs) {
		resourceWs.close();
		resourceWs = null;
	}
	subscribedResourceChannels.clear();
}

function createResourceWebSocket(): WebSocket {
	const config = createAppConfig();
	const ws = new WebSocket(config.websocketUrl);

	ws.onopen = () => {
		console.log('Resource WebSocket connected');
		if (subscribedResourceChannels.size > 0) {
			ws.send(JSON.stringify({ type: 'subscribe', channels: [...subscribedResourceChannels] }));
		}
	};

	ws.onmessage = (event) => {
		try {
			const msg = JSON.parse(event.data);
			if (msg?.type === 'event' && msg.channel?.startsWith('resource_state:')) {
				const data = msg.data as ResourceEvent;
				if (data?.entity_id && data?.resource_id != null && resourceCallback) {
					resourceCallback(data);
				}
			}
		} catch (err) {
			console.error('Resource WebSocket parse error:', err);
		}
	};

	ws.onerror = (error) => console.error('Resource WebSocket error:', error);
	ws.onclose = () => {
		console.log('Resource WebSocket closed');
		resourceWs = null;
	};

	return ws;
}
