import type { MapSelection } from '$lib/types/map';
import { readableCoordinates } from './coordinate-utils';
import L from 'leaflet';

function coordString(latlng: { lat: number; lng: number }): string {
	const coords = readableCoordinates(L.latLng(latlng.lat, latlng.lng));
	return `N: ${coords[0]}&ensp;E: ${coords[1]}`;
}

function coordValues(latlng: { lat: number; lng: number }): [number, number] {
	return readableCoordinates(L.latLng(latlng.lat, latlng.lng));
}

function popupCoordRow(latlng: { lat: number; lng: number }, zoom: number): string {
	const [n, e] = coordValues(latlng);
	return `<div class="bcm-popup-coords-row">
		<span class="bcm-popup-coords">${coordString(latlng)}</span>
		<span class="bcm-popup-copy-actions">
			<button class="bcm-popup-copy-btn" data-action="copy-view-coords" data-n="${n}" data-e="${e}" data-z="${zoom}" data-icon="🔗" aria-label="Copy website link to coordinates" title="Copy website link to coordinates">🔗</button>
			<button class="bcm-popup-copy-btn" data-action="copy-chat-coords" data-n="${n}" data-e="${e}" data-icon="💬" aria-label="Copy in-game chat link to coordinates" title="Copy in-game chat link to coordinates">💬</button>
		</span>
	</div>`;
}

function typeLabel(type: string): string {
	switch (type) {
		case 'claim': return 'Claim';
		case 'cave': return 'Cave';
		case 'resource': return 'Resource';
		case 'player': return 'Player';
		case 'wonder': return 'Wonder';
		case 'temple': return 'Temple';
		case 'ruined-city': return 'Ruined City';
		case 'traveler-camp': return 'Traveler Camp';
		case 'watchtower': return 'Watchtower';
		case 'empire-resource': return 'Empire Resource';
		case 'event': return 'Event';
		case 'dungeon': return 'Dungeon';
		default: return 'Location';
	}
}

function propRow(label: string, value: boolean): string {
	return `<div class="bcm-popup-row">
		<span class="bcm-popup-row-label">${label}</span>
		<span class="bcm-popup-row-val ${value ? 'bcm-popup-row-val--yes' : ''}">${value ? 'Yes' : 'No'}</span>
	</div>`;
}

export function buildPopupHtml(item: MapSelection, zoom: number = 0): string {
	const type = `<span class="bcm-popup-type">${typeLabel(item.type)}</span>`;
	const coords = popupCoordRow(item.latlng, zoom);
	const divider = '<div class="bcm-popup-divider"></div>';

	switch (item.type) {
		case 'claim':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-name">${item.name}</span>
					<span class="bcm-popup-tier">T${item.tier}</span>
				</div>
				${coords}
				${divider}
				<div class="bcm-popup-props">
					${propRow('Bank', item.hasBank)}
					${propRow('Market', item.hasMarket)}
					${propRow('Waystone', item.hasWaystone)}
				</div>
				${divider}
				<a class="bcm-popup-link" href="https://bitjita.com/claims/${item.entityId}" target="_blank" rel="noopener noreferrer">View on bitjita.com</a>
				<div class="bcm-popup-body"></div>
			</div>`;

		case 'cave':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-name">${item.name}</span>
					<span class="bcm-popup-tier">T${item.tier}</span>
				</div>
				${coords}
				<div class="bcm-popup-body"></div>
			</div>`;

		case 'resource':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-swatch" style="background-color:${item.color}"></span>
					<span class="bcm-popup-name">${item.name}</span>
					<span class="bcm-popup-tier">T${item.tier}</span>
				</div>
				${coords}
				<div class="bcm-popup-body"></div>
			</div>`;

		case 'player':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-dot" style="background-color:${item.signedIn ? '#22c55e' : '#6b7280'}; color:${item.signedIn ? '#22c55e' : '#6b7280'}"></span>
					<span class="bcm-popup-name">${item.username}</span>
					<span class="bcm-popup-status">${item.signedIn ? 'Online' : 'Offline'}</span>
				</div>
				${coords}
				<div class="bcm-popup-footer">
					<button class="bcm-popup-action bcm-popup-action--green" data-action="follow-player" data-entity-id="${item.entityId}" data-username="${item.username}">
						${item.isFollowing ? "Stop Following" : "Follow Player"}
					</button>
				</div>
			</div>`;

		case 'watchtower':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-name">${item.name}</span>
				</div>
				<div class="bcm-popup-title">
				    <span class="bcm-popup-swatch" style="background-color:${item.fillColor ?? '#3388ff'};border-color:${item.outlineColor ?? '#000000'};border-width:1px;"></span>
					<span class="bcm-popup-name">${item.owner}</span>
				</div>
				${divider}
				${coords}
				${item.chunkCount ? `<div class="bcm-popup-coords">${item.chunkCount} chunks</div>` : ''}
				${item.ownerId ? `<a class="bcm-popup-link" href="https://bitjita.com/empires/${item.ownerId}" target="_blank" rel="noopener noreferrer">View empire on bitjita.com</a>` : ''}
				<div class="bcm-popup-body"></div>
			</div>`;

		case 'empire-resource':
		case 'event':
			const timer = item.timer ? new Date(item.timer) : undefined;
			const isEvent = item.type === 'event';
			const ready = timer ? timer.getTime() <= Date.now() : !isEvent;
			const timerLabel = item.type === 'event' ? 'Starts' : 'Available';
			const timerString = timer?.toLocaleString() ?? (isEvent ? "Unknown" : "Now");
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-swatch" style="background-color:${ready ? '#22c55e' : '#6b7280'}"></span>
					<span class="bcm-popup-name">${item.name}</span>
				</div>
				${coords}
				<div class="bcm-popup-body">
					<div class="bcm-popup-props">
						<div class="bcm-popup-row">
							<span class="bcm-popup-row-label">${timerLabel}</span>
							<span class="bcm-popup-row-val ${ready ? 'bcm-popup-row-val--yes' : ''}">
								${timerString}
							</span>
						</div>
					</div>
				</div>
			</div>`;

		default:
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-name">${item.name}</span>
				</div>
				${coords}
				<div class="bcm-popup-body"></div>
				${item.type === "traveler-camp" ? `<div class="bcm-popup-footer">Provides lost item recovery</div>` : ""}
			</div>`;
	}
}
