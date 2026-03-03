import type { MapSelection } from '$lib/types/map';
import { readableCoordinates } from './coordinate-utils';
import L from 'leaflet';

function coordString(latlng: { lat: number; lng: number }): string {
	const coords = readableCoordinates(L.latLng(latlng.lat, latlng.lng));
	return `N: ${coords[0]}&ensp;E: ${coords[1]}`;
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
		case 'watchtower': return 'Watchtower';
		case 'hexite': return 'Hexite Deposit';
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

export function buildPopupHtml(item: MapSelection): string {
	const type = `<span class="bcm-popup-type">${typeLabel(item.type)}</span>`;
	const coords = `<div class="bcm-popup-coords">${coordString(item.latlng)}</div>`;
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
					<button class="bcm-popup-action bcm-popup-action--green" data-action="follow-player" data-entity-id="${item.entityId}" data-username="${item.username}">Follow Player</button>
				</div>
			</div>`;

		case 'watchtower':
			return `<div class="bcm-popup">
				${type}
				<div class="bcm-popup-title">
					<span class="bcm-popup-swatch" style="background-color:${item.fillColor ?? '#3388ff'}"></span>
					<span class="bcm-popup-name">${item.name}</span>
				</div>
				${coords}
				${item.chunkCount ? `<div class="bcm-popup-coords" style="padding-top:2px">${item.chunkCount} chunks</div>` : ''}
				<div class="bcm-popup-body"></div>
			</div>`;

		case 'hexite':
			const timer = item.timer ? new Date(item.timer) : undefined;
			const ready = !timer || timer.getTime() <= Date.now();
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
							<span class="bcm-popup-row-label">Available</span>
							<span class="bcm-popup-row-val ${ready ? 'bcm-popup-row-val--yes' : ''}">
								${ready ? 'Now' : timer.toLocaleString()}
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
			</div>`;
	}
}
