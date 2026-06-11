export type LayerName =
	| 'eventsLayer'
	| 'treesLayer'
	| 'hexiteLayer'
	| 'templesLayer'
	| 'ruinedLayer'
	| 'banksLayer'
	| 'marketsLayer'
	| 'waystonesLayer'
	| 'gridsLayer'
	| 'dungeonsLayer'
	| 'territoriesLayer'
	| 'towersLayer'
	| 'waypointsLayer'
	| 'roadsLayer'
	| `claimT${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}Layer`
	| `caveT${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}Layer`;

export interface LayerGroupDef {
	title: string;
	layers: string[];
	defaultCollapsed?: boolean;
}

export const OVERLAY_LAYERS: Set<string> = new Set([
	"Roads",
	"Grids",
	"Territories"
]);

export const LAYER_GROUPS: Record<string, LayerGroupDef> = {
	poi: {
		title: 'Points of Interest',
		layers: [
			'Events',
			'Wonders',
			'Temples',
			'Ruined Cities',
			'Dungeons',
			'Custom Waypoints'
		]
	},
	empires: {
		title: 'Empires',
		layers: [
			'Hexite Deposits',
			'Watchtowers',
			"Territories"
		],
		defaultCollapsed: true
	},
	claims: {
		title: 'Claims',
		layers: [
			'Banks',
			'Markets',
			'Waystones',
			'Claims T1',
			'Claims T2',
			'Claims T3',
			'Claims T4',
			'Claims T5',
			'Claims T6',
			'Claims T7',
			'Claims T8',
			'Claims T9',
			'Claims T10'
		],
		defaultCollapsed: true
	},
	caves: {
		title: 'Caves',
		layers: [
			'Caves T1',
			'Caves T2',
			'Caves T3',
			'Caves T4',
			'Caves T5',
			'Caves T6',
			'Caves T7',
			'Caves T8',
			'Caves T9',
			'Caves T10'
		],
		defaultCollapsed: true
	}
};
