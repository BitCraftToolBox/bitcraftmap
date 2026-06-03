/**
 * relay-service.ts
 *
 * Manages the SpacetimeDB relay connection for tracking resource and enemy
 * entity locations on the map.
 *
 * Connection lifecycle
 * --------------------
 * The builder is created once (initRelayService). build() is called only when
 * at least one entity is being tracked. When all entities are removed the
 * connection is cleanly disconnected. If the connection drops unexpectedly
 * (error) while entities are still tracked it is automatically re-established.
 * On planned teardown (destroyRelayService / last entity removed) reconnection
 * is suppressed.
 *
 * Each reconnect re-registers all table callbacks and recreates every active
 * subscription from scratch.
 *
 * Subscriptions
 * -------------
 * Each tracked entity has its own SubscriptionHandle (returned by
 * subscriptionBuilder().subscribe(queries)). For a single region filter an
 * array with one typed query is used; for multiple regions the array contains
 * one query per region (SpacetimeDB merges them as a UNION in the client
 * cache). The typed query builders from the relay-bindings are used — no raw
 * SQL strings.
 *
 * Initial population vs real-time updates
 * ----------------------------------------
 * When the subscription's onApplied fires the canvas layer is bulk-populated
 * from the local client cache in one pass (O(n)). Individual row callbacks
 * (onInsert / onDelete / onUpdate) are ignored until initialLoadComplete is
 * true so the initial burst of inserts doesn't cause O(n²) cache iterations.
 * After that each callback rebuilds only the single affected region.
 *
 * Region changes
 * --------------
 * A new subscription is made first; the old one is unsubscribed inside the
 * new subscription's onApplied so the server sends us only the delta.
 */

import type {ResourceCanvasLayer} from '$lib/map/resource-canvas-layer';
import type {AppConfig} from '$lib/types/map';
import type {RowTypedQuery} from 'spacetimedb';
import {DbConnection, DbConnectionBuilder, type ErrorContext, type EventContext, type SubscriptionHandle, tables,} from '../../relay-bindings';
import type {EnemyLocation, PlayerLocation, PlayerState, ResourceLocation} from '../../relay-bindings/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EntityType = 'resource' | 'enemy';

interface TrackedEntity {
	type: EntityType;
	subscription: SubscriptionHandle | null;
}

/**
 * Called whenever a tracked player's state or location changes.
 * x and z are already divided by 1000 (map coordinates). Both are null if the
 * player has no location row (e.g. offline / not yet loaded).
 */
export type PlayerUpdateCallback = (
	entityId: string,
	name: string,
	online: boolean,
	x: number | null,
	z: number | null,
) => void;

interface TrackedPlayer {
	callback: PlayerUpdateCallback;
	subscription: SubscriptionHandle | null;
}

// ---------------------------------------------------------------------------
// Module-level singleton state
// ---------------------------------------------------------------------------

let builder: DbConnectionBuilder | null = null;
let connection: DbConnection | null = null;
let isConnecting = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let regionChangeTimer: ReturnType<typeof setTimeout> | null = null;

const RECONNECT_DELAY_MS = 5_000;
const REBUILD_DEBOUNCE_MS = 500;

// Dirty tracking for batched rebuilds
const dirtyResourceRegions = new Set<string>();
const dirtyEnemyRegions = new Set<string>();
let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

class TrackedEntities {
	resources = new Map<number, TrackedEntity>();
	enemies = new Map<number, TrackedEntity>();
	size() {
		return this.resources.size + this.enemies.size;
	}
	* entries() {
		yield* this.resources.entries();
		yield* this.enemies.entries();
	}
	* values() {
		yield* this.resources.values();
		yield* this.enemies.values();
	}
	clear() {
		this.resources.clear();
		this.enemies.clear();
	}
	has(id: number, type: EntityType) {
		if (type === 'resource') {
			return this.resources.has(id);
		} else {
			return this.enemies.has(id);
		}
	}
	get(id: number, type: EntityType) {
		if (type === 'resource') {
			return this.resources.get(id);
		} else {
			return this.enemies.get(id);
		}
	}
	set(id: number, type: EntityType, value: TrackedEntity) {
		if (type === 'resource') {
			return this.resources.set(id, value);
		} else {
			return this.enemies.set(id, value);
		}
	}
	delete(id: number, type: EntityType) {
		if (type === 'resource') {
			return this.resources.delete(id);
		} else {
			return this.enemies.delete(id);
		}
	}
}

const trackedEntities = new TrackedEntities();
const trackedPlayers = new Map<string, TrackedPlayer>();
let resourceAccessor: () => Record<number, ResourceCanvasLayer>;
let enemyAccessor: () => Record<number, ResourceCanvasLayer>;
let regions: number[] = [];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the relay service. Creates and stores the connection builder but
 * does NOT open a connection yet — that happens lazily when the first entity
 * is tracked.
 */
export function initRelayService(
	config: AppConfig,
	getResourceLayersFn: () => Record<number, ResourceCanvasLayer>,
	getEnemyLayersFn: () => Record<number, ResourceCanvasLayer>,
	initialRegions: number[]
): void {
	if (builder) {
		console.warn('[Relay] Already initialised – ignoring duplicate call');
		return;
	}

	resourceAccessor = getResourceLayersFn;
	enemyAccessor = getEnemyLayersFn;
	regions = initialRegions;

	const tokenKey = `prism:${config.relayHost}/${config.relayModule}/auth_token`;

	// Build the builder once. onConnect / onDisconnect / onConnectError are
	// registered here; they carry through to every connection opened via build().
	builder = DbConnection.builder()
		.withUri(config.relayHost)
		.withDatabaseName(config.relayModule)
		.withToken(localStorage.getItem(tokenKey) ?? undefined)
		.onConnect((conn, identity, token) => {
			isConnecting = false;
			localStorage.setItem(tokenKey, token);
			console.log('[Relay] Connected, identity:', identity.toHexString());

			// Register table-level row callbacks on this connection instance.
			conn.db.resource_location.onInsert(handleResourceInsert);
			conn.db.resource_location.onDelete(handleResourceDelete);
			conn.db.resource_location.onUpdate(handleResourceUpdate);
			conn.db.enemy_location.onInsert(handleEnemyInsert);
			conn.db.enemy_location.onDelete(handleEnemyDelete);
			conn.db.enemy_location.onUpdate(handleEnemyUpdate);
			conn.db.player_state.onInsert(handlePlayerStateInsert);
			conn.db.player_state.onUpdate(handlePlayerStateUpdate);
			// leave the frontend stale, they'll probably re-appear in another region soon
			// conn.db.player_state.onDelete(handlePlayerStateDelete);
			conn.db.player_location.onInsert(handlePlayerLocationInsert);
			conn.db.player_location.onUpdate(handlePlayerLocationUpdate);
			conn.db.player_location.onDelete(handlePlayerLocationDelete);

			// Recreate subscriptions for all already-tracked entities.
			for (const [id, entity] of trackedEntities.entries()) {
				entity.subscription = _createSubscription(conn, id, entity);
			}
			for (const [entityId, player] of trackedPlayers.entries()) {
				player.subscription = _createPlayerSubscription(conn, entityId);
			}
		})
		.onDisconnect((ctx: ErrorContext) => {
			isConnecting = false;
			connection = null;
			for (const entity of trackedEntities.values()) {
				entity.subscription = null;
			}
			for (const player of trackedPlayers.values()) {
				player.subscription = null;
			}

			if (ctx.event) {
				console.log("[Relay] Disconnected abnormally:", ctx.event)
				if (trackedEntities.size() || trackedPlayers.size) {
					console.log("[Relay] Attempting to reconnect in", RECONNECT_DELAY_MS, 'ms...')
					reconnectTimer = setTimeout(_connect, RECONNECT_DELAY_MS);
				}
			} else {
				console.log("[Relay] Disconnected.")
			}
		})
		.onConnectError((ctx: ErrorContext) => {
			isConnecting = false;
			if (ctx.event) {
				console.error('[Relay] Connection error:', ctx.event);
			}
			if (trackedEntities.size() === 0 && trackedPlayers.size === 0) return;
			console.warn('[Relay] Attempting to reconnect in', RECONNECT_DELAY_MS, 'ms...');
			reconnectTimer = setTimeout(_connect, RECONNECT_DELAY_MS);
		});
}

/**
 * Disconnect from the relay, suppress auto-reconnect, and reset all state.
 * Call from MapContainer's onMount cleanup function.
 */
export function destroyRelayService(): void {
	_disconnect();
	if (rebuildTimer !== null) {
		clearTimeout(rebuildTimer);
		rebuildTimer = null;
	}
	if (regionChangeTimer !== null) {
		clearTimeout(regionChangeTimer);
		regionChangeTimer = null;
	}
	dirtyResourceRegions.clear();
	dirtyEnemyRegions.clear();
	trackedEntities.clear();
	for (const player of trackedPlayers.values()) {
		player.subscription?.unsubscribe();
	}
	trackedPlayers.clear();
	builder = null;
	resourceAccessor = () => ({});
	enemyAccessor = () => ({});
}

/**
 * Begin tracking an entity. Creates a SpacetimeDB subscription filtered to
 * the given entity ID and region list. Opens the connection if needed.
 *
 * The canvas layer must already be registered in the map returned by
 * getLayers() before this is called (onApplied needs to find it).
 */
export function trackEntity(
	id: number,
	type: EntityType,
): void {
	if (trackedEntities.has(id, type)) return;

	const entity: TrackedEntity = {
		type,
		subscription: null,
	};
	trackedEntities.set(id, type, entity);

	if (!connection?.isActive) {
		// Not connected — connect now; onConnect will create the subscription.
		_connect();
	} else {
		entity.subscription = _createSubscription(connection, id, entity);
	}
}

/**
 * Stop tracking an entity. Unsubscribes and clears the canvas layer.
 * Disconnects from the relay when no entities remain.
 */
export function untrackEntity(id: number, type: 'enemy' | 'resource'): void {
	const entity = trackedEntities.get(id, type);
	if (!entity) return;

	entity.subscription?.unsubscribe();
	trackedEntities.delete(id, type);

	// Drop the connection when nothing left to track.
	if (trackedEntities.size() === 0 && trackedPlayers.size === 0) {
		_disconnect();
	}
}

/**
 * Update the tracked region set for every currently-tracked entity.
 * Creates a new subscription first; the old one is dropped only after the new
 * subscription's onApplied fires so the server computes the minimal delta.
 */
export function updateAllEntityRegions(newRegions: number[]): void {
	if (!connection?.isActive) {
		regions = newRegions;
		return;
	}

	// we throttle this so that rapidly toggling regions on/off in the panel doesn't cause
	// high subscription volume. all subscriptions will be re-sent once the user makes up their mind.
	function _update(_new: number[]) {
		if (!connection?.isActive) return;
		regions = newRegions;
		for (const [id, entity] of trackedEntities.entries()) {
			_updateEntityRegions(connection, id, entity);
		}
	}
	if (regionChangeTimer !== null) {
		clearTimeout(regionChangeTimer);
	}
	regionChangeTimer = setTimeout(_update, 1500, newRegions);
}

/**
 * Begin tracking a player. Subscribes to player_state and player_location for
 * the given entity ID. The callback is invoked on initial population and on
 * every subsequent state or location change.
 */
export function trackPlayer(entityId: string, callback: PlayerUpdateCallback): void {
	if (trackedPlayers.has(entityId)) return;

	const player: TrackedPlayer = { callback, subscription: null };
	trackedPlayers.set(entityId, player);

	if (!connection?.isActive) {
		_connect();
	} else {
		player.subscription = _createPlayerSubscription(connection, entityId);
	}
}

/**
 * Stop tracking a player. Unsubscribes and removes from the tracked set.
 * Disconnects from the relay when no entities or players remain.
 */
export function untrackPlayer(entityId: string): void {
	const player = trackedPlayers.get(entityId);
	if (!player) return;

	player.subscription?.unsubscribe();
	trackedPlayers.delete(entityId);

	if (trackedEntities.size() === 0 && trackedPlayers.size === 0) {
		_disconnect();
	}
}

// ---------------------------------------------------------------------------
// Connection management
// ---------------------------------------------------------------------------

function _connect(): void {
	if (!builder || connection?.isActive || isConnecting) return;

	if (reconnectTimer !== null) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}

	isConnecting = true;
	connection = builder.build();
}

function _disconnect(): void {
	if (reconnectTimer !== null) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	if (connection) {
		connection.disconnect();
	}
}

// ---------------------------------------------------------------------------
// Subscription helpers
// ---------------------------------------------------------------------------

/**
 * Build an array of typed queries for a given entity + region list.
 *
 * We produce one query per region so that the subscription array acts as a
 * UNION in the client cache. When regions is empty a single unfiltered-by-
 * region query is emitted (use with care on large tables).
 */
function _buildQueries(
	type: EntityType,
	id: number
): RowTypedQuery<any, any>[] {
	if (type === 'resource') {
		if (regions.length === 0) {
			return [tables.resource_location.where(r => r.resourceId.eq(id))];
		}
		return regions.map(rg =>
			tables.resource_location.where(r => r.resourceId.eq(id).and(r.regionId.eq(rg)))
		);
	} else {
		if (regions.length === 0) {
			return [tables.enemy_location.where(r => r.enemyType.eq(id))];
		}
		return regions.map(rg =>
			tables.enemy_location.where(r => r.enemyType.eq(id).and(r.regionId.eq(rg)))
		);
	}
}

function _createSubscription(
	conn: DbConnection,
	id: number,
	entity: TrackedEntity
): SubscriptionHandle {
	return conn
		.subscriptionBuilder()
		.onApplied(() => {
			_populateFromCache(conn, id, entity.type);
		})
		.onError((ctx: ErrorContext) => {
			console.error(`[Relay] Subscription error for ${entity.type} ${id}:`, ctx.event);
		})
		.subscribe(_buildQueries(entity.type, id));
}

function _updateEntityRegions(
	conn: DbConnection,
	id: number,
	entity: TrackedEntity,
): void {
	const oldSub = entity.subscription;

	entity.subscription = conn
		.subscriptionBuilder()
		.onApplied(() => {
			// Drop the old subscription now that the server has sent us the delta.
			oldSub?.unsubscribe();
			_populateFromCache(conn, id, entity.type);
		})
		.onError((ctx: ErrorContext) => {
			console.error(`[Relay] Subscription update error for ${entity.type} ${id}:`, ctx.event);
		})
		.subscribe(_buildQueries(entity.type, id));
}

function _createPlayerSubscription(conn: DbConnection, entityId: string): SubscriptionHandle {
	const bigId = BigInt(entityId);
	return conn
		.subscriptionBuilder()
		.onApplied(() => {
			_populatePlayerFromCache(conn, entityId, bigId);
		})
		.onError((ctx: ErrorContext) => {
			console.error(`[Relay] Subscription error for player ${entityId}:`, ctx.event);
		})
		.subscribe([
			tables.player_state.where(r => r.entityId.eq(bigId)),
			tables.player_location.where(r => r.entityId.eq(bigId)),
		]);
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

/**
 * Bulk-populate a canvas layer from the local client cache.
 * Called once per entity per (re)connect, from onApplied.
 */
function _populateFromCache(conn: DbConnection, id: number, type: EntityType): void {
	const layer = type === 'resource' ? resourceAccessor()[id] : enemyAccessor()[id];
	if (!layer) return;

	const byRegion = new Map<number, [number, number][]>();

	if (type === 'resource') {
		for (const row of conn.db.resource_location.iter()) {
			if (row.resourceId !== id) continue;
			const rid = row.regionId as number;
			let pts = byRegion.get(rid);
			if (!pts) { pts = []; byRegion.set(rid, pts); }
			pts.push([row.x, row.z]);
		}
	} else {
		for (const row of conn.db.enemy_location.iter()) {
			if (row.enemyType !== id) continue;
			const rid = row.regionId as number;
			let pts = byRegion.get(rid);
			if (!pts) { pts = []; byRegion.set(rid, pts); }
			pts.push([row.x / 1000, row.z / 1000]);
		}
	}

	layer.clearAllRegions();
	for (const [regionId, coords] of byRegion.entries()) {
		layer.setRegionPoints(regionId, coords);
	}
}

/**
 * Notify a tracked player's callback with current state from the client cache.
 * Called from the player subscription's onApplied.
 */
function _populatePlayerFromCache(conn: DbConnection, entityId: string, bigId: bigint): void {
	const tracked = trackedPlayers.get(entityId);
	if (!tracked) return;

	const state = conn.db.player_state.entity_id.find(bigId);
	if (!state) return;

	const loc = conn.db.player_location.entity_id.find(bigId);
	tracked.callback(
		entityId,
		state.name,
		state.online,
		loc ? loc.x / 1000 : null,
		loc ? loc.z / 1000 : null,
	);
}

// ---------------------------------------------------------------------------
// Row change callbacks
// These are registered on each new connection instance inside onConnect.
// The ctx.db accessor gives us the table cache for that connection.
// ---------------------------------------------------------------------------

function handleResourceInsert(ctx: EventContext, row: ResourceLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	_markRegionDirty('resource', row.resourceId, row.regionId as number);
}

function handleResourceDelete(ctx: EventContext, row: ResourceLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	_markRegionDirty('resource', row.resourceId, row.regionId as number);
}

function handleResourceUpdate(ctx: EventContext, _old: ResourceLocation, row: ResourceLocation): void {
	handleResourceInsert(ctx, row);
}

function handleEnemyInsert(ctx: EventContext, row: EnemyLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	_markRegionDirty('enemy', row.enemyType, row.regionId as number);
}

function handleEnemyDelete(ctx: EventContext, row: EnemyLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	_markRegionDirty('enemy', row.enemyType, row.regionId as number);
}

function handleEnemyUpdate(ctx: EventContext, _old: EnemyLocation, row: EnemyLocation): void {
	handleEnemyInsert(ctx, row);
}

function handlePlayerStateInsert(ctx: EventContext, row: PlayerState): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	const entityId = row.entityId.toString();
	const tracked = trackedPlayers.get(entityId);
	if (!tracked) return;
	const loc = connection?.db.player_location.entity_id.find(row.entityId);
	tracked.callback(entityId, row.name, row.online, loc ? loc.x / 1000 : null, loc ? loc.z / 1000 : null);
}

function handlePlayerStateUpdate(ctx: EventContext, _old: PlayerState, row: PlayerState): void {
	handlePlayerStateInsert(ctx, row);
}

function handlePlayerLocationInsert(ctx: EventContext, row: PlayerLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	const entityId = row.entityId.toString();
	const tracked = trackedPlayers.get(entityId);
	if (!tracked) return;
	const state = connection?.db.player_state.entity_id.find(row.entityId);
	if (!state) return;
	tracked.callback(entityId, state.name, state.online, row.x / 1000, row.z / 1000);
}

function handlePlayerLocationUpdate(ctx: EventContext, _old: PlayerLocation, row: PlayerLocation): void {
	handlePlayerLocationInsert(ctx, row);
}

function handlePlayerLocationDelete(ctx: EventContext, row: PlayerLocation): void {
	if (ctx.event.tag === "SubscribeApplied") return;
	const entityId = row.entityId.toString();
	const tracked = trackedPlayers.get(entityId);
	if (!tracked) return;
	const state = connection?.db.player_state.entity_id.find(row.entityId);
	if (!state) return;
	tracked.callback(entityId, state.name, state.online, null, null);
}

/**
 * Mark a region/entity as dirty and schedule batch rebuild if not already scheduled.
 */
function _markRegionDirty(type: EntityType, entityId: number, regionId: number): void {
	const key = `${entityId}:${regionId}`;
	if (type === 'resource') {
		dirtyResourceRegions.add(key);
	} else {
		dirtyEnemyRegions.add(key);
	}

	if (rebuildTimer === null) {
		rebuildTimer = setTimeout(_processDirtyRegions, REBUILD_DEBOUNCE_MS);
	}
}

/**
 * Process all accumulated dirty regions and rebuild their layers at once.
 * Single pass through each table's cache, collecting data for all dirty regions.
 */
function _processDirtyRegions(): void {
	if (!connection?.isActive) {
		dirtyResourceRegions.clear();
		dirtyEnemyRegions.clear();
		rebuildTimer = null;
		return;
	}

	const db = connection.db;

	// Single pass for resources: collect by entityId -> regionId
	if (dirtyResourceRegions.size > 0) {
		const dirtyByEntity = new Map<number, Map<number, [number, number][]>>();

		// Populate the nested map from dirty keys
		for (const key of dirtyResourceRegions) {
			const [entityIdStr, regionIdStr] = key.split(':');
			const entityId = parseInt(entityIdStr, 10);
			const regionId = parseInt(regionIdStr, 10);

			if (!dirtyByEntity.has(entityId)) {
				dirtyByEntity.set(entityId, new Map());
			}
			dirtyByEntity.get(entityId)!.set(regionId, []);
		}

		// Single iteration: collect points for all dirty entity/region combinations
		for (const row of db.resource_location.iter()) {
			const entityMap = dirtyByEntity.get(row.resourceId);
			if (!entityMap) continue;

			const regionId = row.regionId as number;
			const pts = entityMap.get(regionId);
			if (!pts) continue;

			pts.push([row.x, row.z]);
		}

		// Update layers
		for (const [entityId, regionMap] of dirtyByEntity) {
			const layer = resourceAccessor()[entityId];
			if (!layer) continue;

			for (const [regionId, coords] of regionMap) {
				if (coords.length > 0) {
					layer.setRegionPoints(regionId, coords);
				} else {
					layer.clearRegion(regionId);
				}
			}
		}

		dirtyResourceRegions.clear();
	}

	// Single pass for enemies: collect by entityId -> regionId
	if (dirtyEnemyRegions.size > 0) {
		const dirtyByEntity = new Map<number, Map<number, [number, number][]>>();

		// Populate the nested map from dirty keys
		for (const key of dirtyEnemyRegions) {
			const [entityIdStr, regionIdStr] = key.split(':');
			const entityId = parseInt(entityIdStr, 10);
			const regionId = parseInt(regionIdStr, 10);

			if (!dirtyByEntity.has(entityId)) {
				dirtyByEntity.set(entityId, new Map());
			}
			dirtyByEntity.get(entityId)!.set(regionId, []);
		}

		// Single iteration: collect points for all dirty entity/region combinations
		for (const row of db.enemy_location.iter()) {
			const entityMap = dirtyByEntity.get(row.enemyType);
			if (!entityMap) continue;

			const regionId = row.regionId as number;
			const pts = entityMap.get(regionId);
			if (!pts) continue;

			pts.push([row.x / 1000, row.z / 1000]);
		}

		// Update layers
		for (const [entityId, regionMap] of dirtyByEntity) {
			const layer = enemyAccessor()[entityId];
			if (!layer) continue;

			for (const [regionId, coords] of regionMap) {
				if (coords.length > 0) {
					layer.setRegionPoints(regionId, coords);
				} else {
					layer.clearRegion(regionId);
				}
			}
		}

		dirtyEnemyRegions.clear();
	}

	rebuildTimer = null;
}

