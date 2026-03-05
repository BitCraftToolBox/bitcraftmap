import {
    ClaimLocalState,
    ClaimState,
    DbConnection,
    EmpireChunkState,
    EmpireState, RemoteTables,
    WorldRegionNameState
} from './bindings/src'
import * as fs from "node:fs";
import * as path from "node:path";

fs.existsSync('.env.local') && require('dotenv').config({path: '.env.local'});
const data_dir = process.env.DATA_DIR || "../static/markers/";
!fs.existsSync(data_dir) && fs.mkdirSync(data_dir, {recursive: true});

interface HexitDepositTimer {
    entityId: bigint;
    location: { x: number, z: number };
    endTimestamp: Date;
}

interface RegionData {
    claimState: ClaimState[],
    claimLocalState: ClaimLocalState[],
    empireChunkState: EmpireChunkState[],
    empireState: EmpireState[],
    worldRegionNameState: WorldRegionNameState[],
    hexiteTimers: HexitDepositTimer[]
}

interface OutputData {
    towers: any[];
    caves: any[],
    trees: any[],
    ruined: any[],
    temples: any[],
    dungeons: any[],
    grids: any[]
}

const categories = {
    'Wonder': [433549604, 421789207],
    'Temple': [489406613, 1752479333, 1662809355, 2034914963, 1008368350],
    'Cave': [1845065396, 280863630, 696858550, 1440765680, 312420794, 1875067311, 253216585, 1477951340],
    'Dungeon': [1785852446, 846734170, 208697589, 1084069097],
    'RuinedTown': [292245080],
    'Ruins': [1441436391, 1842388176], // we don't use these right now. usually people just track the resource nodes instead
    'Watchtower': [90000]
}

// Color palette: visually distinct colors
const COLOR_PALETTE = [
    "#0000ff",
    "#ff0000",
    "#00ff00",
    "#c71585",
    "#00ffff",
    "#808000",
    "#1e90ff"
];

function formatTemplateArgs(value: string) {
    if (!value.includes('|~')) {
        return value;
    }
    const [template, ...args] = value.split('|~');
    return template.replace(/\{(\d+)}/g, (match, index) => {
        const argIndex = Number(index);
        if (!Number.isInteger(argIndex) || argIndex < 0 || argIndex >= args.length) {
            return match;
        }
        return args[argIndex];
    });
}

function collateHexite(db: RemoteTables): HexitDepositTimer[] {
    const timers: HexitDepositTimer[] = [];
    for (const growth of db.growthState.iter()) {
        if (growth.growthRecipeId !== 1577969715) {
            continue;
        }
        const locRow = db.locationState.entityId.find(growth.entityId);
        if (locRow) {
            timers.push({
                entityId: growth.entityId,
                location: {x: locRow.x, z: locRow.z},
                endTimestamp: growth.endTimestamp.toDate()
            });
        }
    }
    return timers;
}

const onConnect = (resolve: (_: RegionData) => void, first: boolean) =>
    (conn: DbConnection) => {
        const subs = [
            'SELECT * FROM claim_state',
            'SELECT * FROM claim_local_state',
            'SELECT * FROM world_region_name_state',
            // hexite deposit regeneration - growth state has the entity id -> end timestamp, location state has entity_id -> location
            'SELECT * FROM growth_state WHERE growth_recipe_id = 1577969715',
            'SELECT loc.* FROM location_state loc JOIN growth_state gs ON gs.entity_id = loc.entity_id WHERE gs.growth_recipe_id = 1577969715;',
            // these are synced from global, so only need to pull them once
            ...(first ? [
                'SELECT * FROM empire_chunk_state',
                'SELECT * FROM empire_state',
            ] : [])
        ];
        conn.subscriptionBuilder().onApplied(() => {
            const data: RegionData = {
                claimState: Array.from(conn.db.claimState.iter()),
                claimLocalState: Array.from(conn.db.claimLocalState.iter()),
                empireChunkState: Array.from(conn.db.empireChunkState.iter()),
                empireState: Array.from(conn.db.empireState.iter()),
                worldRegionNameState: Array.from(conn.db.worldRegionNameState.iter()),
                hexiteTimers: collateHexite(conn.db)
            };
            conn.disconnect();
            resolve(data);
        }).subscribe(subs);
    };

async function fetchDataFromRegions(regions: string[]) {
    const data: RegionData = {
        claimState: [],
        claimLocalState: [],
        empireChunkState: [],
        empireState: [],
        worldRegionNameState: [],
        hexiteTimers: []
    }

    let first = true;
    for (const region of regions) {
        const res = await new Promise<RegionData>((resolve, reject) => {
            DbConnection.builder()
                .withUri('wss://' + process.env.BITCRAFT_SPACETIME_HOST)
                .withModuleName(region)
                .withToken(process.env.BITCRAFT_BEARER_TOKEN)
                .onConnect(onConnect(resolve, first))
                .onConnectError((_, err) => {
                    // @ts-ignore
                    if (!err['wasClean']) {
                        reject(err);
                    }
                })
                .onDisconnect(() => {})
                .build()
        });
        data.claimState.push(...res.claimState);
        data.claimLocalState.push(...res.claimLocalState);
        data.empireChunkState.push(...res.empireChunkState);
        data.empireState.push(...res.empireState);
        const nameState = res.worldRegionNameState[0];
        data.worldRegionNameState.push({
            id: Number(region.substring('bitcraft-live-'.length)),
            playerFacingName: nameState.playerFacingName,
            moduleNamePrefix: nameState.moduleNamePrefix
        });
        data.hexiteTimers.push(...res.hexiteTimers);
        first = false;
    }

    return data;
}

function makeFeature(props: any, loc: { x: number, z: number }) {
    return {
        type: "Feature",
        properties: props,
        geometry: {
            type: "Point",
            coordinates: [loc.x, loc.z]
        }
    }
}

function makeTower(claimState: ClaimState, localState: ClaimLocalState, territories: WatchtowerTerritory[]) {
    const territory = territories.find(t => t.entityId === claimState.ownerBuildingEntityId);
    const props = {
        popupText: formatTemplateArgs(claimState.name)
            + '<br>' + (territory ? `Chunks: ${territory.totalChunks}` : '')
            + '<br>' + (territory ? `Owner: ${territory.ownerName}` : ''),
        chunkCount: territory?.totalChunks,
    };
    if (!territory || !territory.chunkIndices || territory.chunkIndices.length === 0) {
        return {
            type: "FeatureCollection",
            features: [
                makeFeature(props, localState.location!)
            ]
        };
    }
    // For each chunk, create a rectangle polygon in tile coordinates
    const polygons: number[][][] = territory.chunkIndices.map(idx => {
        const { chunk_x, chunk_z } = chunkIndexToXZ(idx);
        const { x: x0, z: z0 } = chunkXZToTileCoords(chunk_x, chunk_z);
        const { x: x1, z: z1 } = chunkXZToTileCoords(chunk_x + 1, chunk_z + 1);
        return [
            [x0, z0],
            [x1, z0],
            [x1, z1],
            [x0, z1],
            [x0, z0]
        ];
    });
    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    fillOpacity: 0.2,
                    fillColor: territory.color,
                    pointCoords: [localState.location!.z, localState.location!.x],
                    popupText: props.popupText
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: polygons.map(p => [p])
                }
            },
            makeFeature(props, localState.location!)
        ]
    };
}

function addFeature(outputs: OutputData, claimState: ClaimState, localState: ClaimLocalState, territories: WatchtowerTerritory[], hexiteTimers: HexitDepositTimer[]) {
    const claimName = formatTemplateArgs(claimState.name);
    switch (localState.buildingDescriptionId) {
        case 433549604: // Tree of Wisdom
        case 421789207: { // Hexite Deposit
            let timer: Date | undefined;
            if (localState.buildingDescriptionId === 421789207) {
                timer = hexiteTimers.find(t => t.location.x === localState.location!.x && t.location.z === localState.location!.z)?.endTimestamp;
            }
            outputs.trees.push(makeFeature({
                name: claimName,
                type: localState.buildingDescriptionId === 421789207 ? 'hexite' :
                        localState.buildingDescriptionId === 433549604 ? 'tree'
                        : 'unreachable',
                timer: timer
            }, localState.location!));
            break;
        }
        // Temples
        case 489406613:
        case 1752479333:
        case 1662809355:
        case 2034914963:
        case 1008368350:
            outputs.temples.push(makeFeature({
                name: claimName
            }, localState.location!));
            break;
        // Ruined Town
        case 292245080:
            outputs.ruined.push(makeFeature({
                name: claimName
            }, localState.location!));
            break;
        // caves
        case 280863630:
        case 1875067311:
        case 1845065396:
        case 696858550:
        case 312420794:
        case 253216585:
        case 1477951340:
        case 1440765680:
            outputs.caves.push(makeFeature({
                name: claimName,
                size: claimName.startsWith('Large ') ? 2 : 1, // always the case
                // TODO grab building_desc and use function level to determine cave tier
                tier: categories.Cave.indexOf(localState.buildingDescriptionId) + 1
            }, localState.location!));
            break;
        // dungeons
        case 1785852446:
        case 846734170:
        case 208697589:
        case 1084069097:
            outputs.dungeons.push(makeFeature({
                popupText: claimName,
                iconName: "dungeon",
                iconSize: localState.buildingDescriptionId == 846734170 ? [25, 25] : [35, 35],
                type: localState.buildingDescriptionId
            }, localState.location!));
            break;
        // watchtower
        case 90000:
            outputs.towers.push(makeTower(claimState, localState, territories));
            break;
    }
}

function bigIntReplacer(key: string, value: any): any {
    if (typeof value === "bigint") {
        return value.toString() + 'n';
    }
    return value;
}

function bigIntReviver(key: string, value: any): any {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
    }
    return value;
}

// --- Watchtower Territory Types and Helpers ---

// A single contiguous group of chunks
export interface ChunkGroup {
    chunks: { chunk_x: number, chunk_z: number, chunk_index: bigint }[];
}

// A watchtower territory: a watchtower and all its chunks (possibly split into contiguous groups)
export interface WatchtowerTerritory {
    entityId: bigint;
    location: { x: number, z: number };
    name: string;
    chunkIndices: bigint[];
    chunkGroups: ChunkGroup[];
    totalChunks: number;
    ownerId: bigint;
    ownerName: string;
    color?: string; // Assigned color from palette
}

// Convert a chunk index to chunk_x, chunk_z
export function chunkIndexToXZ(chunk_index: bigint): { chunk_x: number, chunk_z: number } {
    const n = BigInt(chunk_index);
    const base = n - BigInt(1);
    const chunk_z = Number(base / BigInt(1000));
    const chunk_x = Number(base % BigInt(1000));
    return { chunk_x, chunk_z };
}

// Convert chunk_x, chunk_z to tile coordinates (bottom-left corner)
export function chunkXZToTileCoords(chunk_x: number, chunk_z: number): { x: number, z: number } {
    return { x: chunk_x * 96, z: chunk_z * 96 };
}

// Group a list of chunk indices into contiguous groups
export function groupContiguousChunkIndices(chunkIndices: bigint[]): ChunkGroup[] {
    const coords = chunkIndices.map(idx => ({ ...chunkIndexToXZ(idx), chunk_index: idx }));
    const visited = new Set<string>();
    const chunkSet = new Set(coords.map(c => `${c.chunk_x},${c.chunk_z}`));
    const groups: ChunkGroup[] = [];
    function visit(x: number, z: number, group: ChunkGroup) {
        const key = `${x},${z}`;
        if (visited.has(key) || !chunkSet.has(key)) return;
        visited.add(key);
        const chunk = coords.find(c => c.chunk_x === x && c.chunk_z === z);
        if (chunk) group.chunks.push(chunk);
        [[x - 1, z], [x + 1, z], [x, z - 1], [x, z + 1]].forEach(([nx, nz]) => visit(nx, nz, group));
    }
    for (const c of coords) {
        const key = `${c.chunk_x},${c.chunk_z}`;
        if (visited.has(key)) continue;
        const group: ChunkGroup = { chunks: [] };
        visit(c.chunk_x, c.chunk_z, group);
        if (group.chunks.length > 0) groups.push(group);
    }
    return groups;
}

// --- Build Watchtower Territories ---
function buildWatchtowerTerritories(claimStates: ClaimState[], localStateMap: Map<bigint, ClaimLocalState>, empireChunkStates: EmpireChunkState[], empireState: EmpireState[]): WatchtowerTerritory[] {
    // Map from watchtower entityId to all its chunk indices
    const watchtowerChunks = new Map<bigint, bigint[]>();
    const watchtowerEmpires = new Map<bigint, EmpireState>();
    empireChunkStates.forEach(state => {
        if (!watchtowerChunks.has(state.watchtowerEntityId)) {
            watchtowerChunks.set(state.watchtowerEntityId, []);
        }
        const arr = watchtowerChunks.get(state.watchtowerEntityId);
        if (arr) arr.push(state.chunkIndex);
        if (!watchtowerEmpires.has(state.watchtowerEntityId)) {
            const empire = empireState.find(e => e.entityId === state.empireEntityId);
            if (empire) watchtowerEmpires.set(state.watchtowerEntityId, empire);
        }
    });
    const territories: WatchtowerTerritory[] = [];
    claimStates.forEach(claimState => {
        const localState = localStateMap.get(claimState.entityId);
        if (localState && localState.buildingDescriptionId === 90000) {
            const chunkIndices = watchtowerChunks.get(claimState.ownerBuildingEntityId) || [];
            const chunkGroups = groupContiguousChunkIndices(chunkIndices);
            const empire = watchtowerEmpires.get(claimState.ownerBuildingEntityId);
            territories.push({
                entityId: claimState.ownerBuildingEntityId,
                location: localState.location!,
                name: formatTemplateArgs(claimState.name),
                ownerId: empire ? empire.entityId : BigInt(0),
                ownerName: empire ? empire.name : 'Unknown',
                chunkIndices,
                chunkGroups,
                totalChunks: chunkIndices.length
            });
        }
    });
    return territories;
}

// Returns true if any chunk in territoryA is adjacent to any chunk in territoryB
function areTerritoriesAdjacent(territoryA: WatchtowerTerritory, territoryB: WatchtowerTerritory): boolean {
    const chunkSetA = new Set(territoryA.chunkGroups.flatMap(g => g.chunks.map(c => `${c.chunk_x},${c.chunk_z}`)));
    for (const groupB of territoryB.chunkGroups) {
        for (const chunkB of groupB.chunks) {
            for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1]]) {
                const neighborKey = `${chunkB.chunk_x+dx},${chunkB.chunk_z+dz}`;
                if (chunkSetA.has(neighborKey)) return true;
            }
        }
    }
    return false;
}

// Returns true if the watchtower location of A is within distance (in chunks) of any chunk in B
function areTerritoriesNearby(territoryA: WatchtowerTerritory, territoryB: WatchtowerTerritory, distanceChunks = 15): boolean {
    const distSq = distanceChunks * distanceChunks;
    // Convert watchtower location to chunk coordinates
    const chunkA = {
        chunk_x: Math.floor(territoryA.location.x / 96),
        chunk_z: Math.floor(territoryA.location.z / 96)
    };
    for (const groupB of territoryB.chunkGroups) {
        for (const chunkB of groupB.chunks) {
            const dx = chunkA.chunk_x - chunkB.chunk_x;
            const dz = chunkA.chunk_z - chunkB.chunk_z;
            if (dx*dx + dz*dz <= distSq) return true;
        }
    }
    return false;
}

// Assign colors to territories so that adjacent/nearby territories have unique colors
function assignTerritoryColors(territories: WatchtowerTerritory[], palette: string[], nearbyDistance = 10) {
    // Build adjacency graph
    const n = territories.length;
    const adj = Array.from({length: n}, () => new Set<number>());
    for (let i = 0; i < n; ++i) {
        for (let j = i+1; j < n; ++j) {
            if (areTerritoriesAdjacent(territories[i], territories[j]) ||
                areTerritoriesNearby(territories[i], territories[j], nearbyDistance) ||
                areTerritoriesNearby(territories[j], territories[i], nearbyDistance)) {
                adj[i].add(j);
                adj[j].add(i);
            }
        }
    }
    // Greedy coloring
    const colors = Array(n).fill(-1);
    for (let i = 0; i < n; ++i) {
        const used = new Set(Array.from(adj[i]).map(j => colors[j]));
        for (let c = 0; c < palette.length; ++c) {
            if (!used.has(c)) {
                colors[i] = c;
                break;
            }
        }
        if (colors[i] === -1) {
            // fallback
            console.log(`Warning: not enough colors for territory ${territories[i].name}, assigning default color`);
            colors[i] = 0;
        }
        territories[i].color = palette[colors[i]];
    }
}

async function main() {
    // read live data
    let regions = Array.from({length: 25}, (_, i) => i + 1).filter(i => i > 5 && i < 20 && i % 5 != 0 && (i - 1) % 5 != 0).map(i => 'bitcraft-live-' + i);
    const data = await fetchDataFromRegions(regions);
    fs.writeFileSync(path.join('data.json'), JSON.stringify(data, bigIntReplacer, 2));

    // or read from file for faster dev without hitting servers
    //const data = JSON.parse(fs.readFileSync(path.join('data.json'), 'utf-8'), bigIntReviver) as RegionData;

    const localStateMap = new Map<bigint, ClaimLocalState>();
    data.claimLocalState.forEach(state => {
        localStateMap.set(state.entityId, state);
    });

    // Build all watchtower territories
    const territories = buildWatchtowerTerritories(data.claimState, localStateMap, data.empireChunkState, data.empireState);

    // Assign colors to territories
    assignTerritoryColors(territories, COLOR_PALETTE);

    const outputs: OutputData = {
        caves: [],
        trees: [],
        ruined: [],
        temples: [],
        dungeons: [],
        towers: [],
        grids: []
    }

    // For each claim, add features
    data.claimState.forEach(claimState => {
        const localState = localStateMap.get(claimState.entityId);
        if (!localState) return;
        addFeature(outputs, claimState, localState, territories, data.hexiteTimers);
    });

    // --- Grids output ---
    // Use worldRegionNameState from the first region
    const regionNames = (data.worldRegionNameState || []).map(r => ({ id: r.id, name: r.playerFacingName }));
    // World/region grid parameters
    const regionCount = 5;
    const regionSizeChunks = 80;
    const chunkSize = 96;
    // Center 3x3 regions: rx, rz in 1..3 (0-based)
    const minRegion = 1, maxRegion = 3;
    const minChunk = minRegion * regionSizeChunks;
    const maxChunk = (maxRegion + 1) * regionSizeChunks;
    const gridLines: number[][][] = [];
    // Horizontal chunk lines
    for (let z = minChunk + 1; z < maxChunk; ++z) {
        gridLines.push([
            [minChunk * chunkSize, z * chunkSize],
            [maxChunk * chunkSize, z * chunkSize]
        ]);
    }
    // Vertical chunk lines
    for (let x = minChunk + 1; x < maxChunk; ++x) {
        gridLines.push([
            [x * chunkSize, minChunk * chunkSize],
            [x * chunkSize, maxChunk * chunkSize]
        ]);
    }
    // Add grid lines as a MultiLineString feature
    outputs.grids = [];
    outputs.grids.push({
        type: "Feature",
        properties: { noPan: 1, color: "#737070", weight: 0.4, opacity: 1 },
        geometry: { type: "MultiLineString", coordinates: gridLines }
    });
    // Add region border lines (thicker)
    const regionBorders: number[][][] = [];
    // Horizontal region borders
    for (let rz = minRegion; rz <= maxRegion + 1; ++rz) {
        const z = rz * regionSizeChunks * chunkSize;
        regionBorders.push([
            [minChunk * chunkSize, z],
            [maxChunk * chunkSize, z]
        ]);
    }
    // Vertical region borders
    for (let rx = minRegion; rx <= maxRegion + 1; ++rx) {
        const x = rx * regionSizeChunks * chunkSize;
        regionBorders.push([
            [x, minChunk * chunkSize],
            [x, maxChunk * chunkSize]
        ]);
    }
    outputs.grids.push({
        type: "Feature",
        properties: { noPan: 1, color: "#000000", weight: 2, opacity: 1 },
        geometry: { type: "MultiLineString", coordinates: regionBorders }
    });
    // Add tooltips for the 9 central regions (3x3 in the center)
    for (let rz = minRegion; rz <= maxRegion; ++rz) {
        for (let rx = minRegion; rx <= maxRegion; ++rx) {
            const regionIdx = rz * regionCount + rx + 1;
            const region = regionNames.find(r => r.id === regionIdx);
            if (region) {
                outputs.grids.push({
                    type: "Feature",
                    properties: { type: "tooltip", noPan: 1, popupText: region.name },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            (rx * regionSizeChunks + regionSizeChunks / 2) * chunkSize,
                            (rz * regionSizeChunks + regionSizeChunks / 2) * chunkSize
                        ]
                    }
                });
            }
        }
    }

    function write(name: string, features: any) {
        fs.writeFileSync(path.join(data_dir, name + '.geojson'), JSON.stringify(features));
    }
    write('caves', outputs.caves);
    write('trees', outputs.trees);
    write('ruined', outputs.ruined);
    write('temples', outputs.temples);
    write('dungeons', outputs.dungeons);
    write('towers', outputs.towers);
    write('grids', { type: "FeatureCollection", features: outputs.grids });
}

main().then(() => {
    process.exit(0);
}).catch(error => {
    if (error['wasClean']) {
        process.exit(0);
    }
    console.error('Error:', error);
    process.exit(1);
});

