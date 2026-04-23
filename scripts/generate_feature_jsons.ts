import {
    ClaimLocalState,
    ClaimState,
    DbConnection,
    RemoteTables,
    WorldRegionNameState
} from './bindings/src'
import {
    DbConnection as DbConnectionGlobal,
    EmpireChunkState,
    EmpireColorDesc,
    EmpireEmblemState,
    EmpireState
} from './bindings_global/src'
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

interface GlobalData {
    empireState: EmpireState[],
    empireChunkState: EmpireChunkState[],
    empireColorDesc: EmpireColorDesc[],
    empireEmblemState: EmpireEmblemState[]
}

interface RegionData {
    claimState: ClaimState[],
    claimLocalState: ClaimLocalState[],
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
    'Cave': [790011334, 1845065396, 280863630, 696858550, 1440765680, 312420794, 1875067311, 253216585, 1477951340],
    'Dungeon': [1785852446, 846734170, 208697589, 1084069097],
    'RuinedTown': [292245080],
    'Ruins': [1441436391, 1842388176], // we don't use these right now. usually people just track the resource nodes instead
    'Watchtower': [90000]
}

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

const onConnect = (resolve: (_: RegionData) => void) =>
    (conn: DbConnection) => {
        const subs = [
            'SELECT * FROM claim_state',
            'SELECT * FROM claim_local_state',
            'SELECT * FROM world_region_name_state',
            // hexite deposit regeneration - growth state has the entity id -> end timestamp, location state has entity_id -> location
            'SELECT * FROM growth_state WHERE growth_recipe_id = 1577969715',
            'SELECT loc.* FROM location_state loc JOIN growth_state gs ON gs.entity_id = loc.entity_id WHERE gs.growth_recipe_id = 1577969715;'
        ];
        conn.subscriptionBuilder().onApplied(() => {
            const data: RegionData = {
                claimState: Array.from(conn.db.claimState.iter()),
                claimLocalState: Array.from(conn.db.claimLocalState.iter()),
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
        worldRegionNameState: [],
        hexiteTimers: []
    }

    for (const region of regions) {
        const res = await new Promise<RegionData>((resolve, reject) => {
            DbConnection.builder()
                .withUri('wss://' + process.env.BITCRAFT_SPACETIME_HOST)
                .withModuleName(region)
                .withToken(process.env.BITCRAFT_BEARER_TOKEN)
                .onConnect(onConnect(resolve))
                .onConnectError((_, err) => {
                    // @ts-ignore
                    if (!err['wasClean']) {
                        reject(err);
                    }
                })
                .onDisconnect(() => {
                })
                .build()
        });
        data.claimState.push(...res.claimState);
        data.claimLocalState.push(...res.claimLocalState);
        const nameState = res.worldRegionNameState[0];
        data.worldRegionNameState.push({
            id: Number(region.substring('bitcraft-live-'.length)),
            playerFacingName: nameState.playerFacingName,
            moduleNamePrefix: nameState.moduleNamePrefix
        });
        data.hexiteTimers.push(...res.hexiteTimers);
    }

    return data;
}

const onConnectGlobal = (resolve: (_: GlobalData) => void) =>
    (conn: DbConnectionGlobal) => {
        const subs = [
            'SELECT * FROM empire_state',
            'SELECT * FROM empire_chunk_state',
            'SELECT * FROM empire_color_desc',
            'SELECT * FROM empire_emblem_state'
        ];
        conn.subscriptionBuilder().onApplied(() => {
            const data: GlobalData = {
                empireState: Array.from(conn.db.empireState.iter()),
                empireChunkState: Array.from(conn.db.empireChunkState.iter()),
                empireColorDesc: Array.from(conn.db.empireColorDesc.iter()),
                empireEmblemState: Array.from(conn.db.empireEmblemState.iter())
            };
            conn.disconnect();
            resolve(data);
        }).subscribe(subs);
    };

async function fetchGlobalData(): Promise<GlobalData> {
    return new Promise<GlobalData>((resolve, reject) => {
        DbConnectionGlobal.builder()
            .withUri('wss://' + process.env.BITCRAFT_SPACETIME_HOST)
            .withModuleName('bitcraft-live-global')
            .withToken(process.env.BITCRAFT_BEARER_TOKEN)
            .onConnect(onConnectGlobal(resolve))
            .onConnectError((_, err) => {
                // @ts-ignore
                if (!err['wasClean']) {
                    reject(err);
                }
            })
            .onDisconnect(() => {
            })
            .build()
    });
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
        name: formatTemplateArgs(claimState.name),
        owner: territory ? territory.ownerName : null,
        ownerId: territory? String(territory.ownerId) : null,
        chunkCount: territory?.totalChunks,
        fillColor: territory?.color,
        outlineColor: territory?.outlineColor
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
        const {chunk_x, chunk_z} = chunkIndexToXZ(idx);
        const {x: x0, z: z0} = chunkXZToTileCoords(chunk_x, chunk_z);
        const {x: x1, z: z1} = chunkXZToTileCoords(chunk_x + 1, chunk_z + 1);
        return [
            [x0, z0],
            [x1, z0],
            [x1, z1],
            [x0, z1],
            [x0, z0]
        ];
    });

    // Create outline polygons for each chunk group (each may have holes)
    const groupOutlines: number[][][][] = territory.chunkGroups
        .map(group => createChunkGroupOutline(group))
        .filter(outline => outline.length > 0);

    return {
        type: "FeatureCollection",
        features: [
            // base chunk grid
            {
                type: "Feature",
                properties: {
                    fillOpacity: 0.0,
                    fillColor: territory.color,
                    color: "#7f7f7f",
                    weight: 0.5,
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: polygons.map(p => [p])
                }
            },
            // outline of each contiguous group
            {
                type: "Feature",
                properties: {
                    fillOpacity: 0.6,
                    color: territory.outlineColor || "#000000",
                    weight: 1,
                    pointCoords: [localState.location!.z, localState.location!.x],
                    ...props
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: groupOutlines
                }
            },
            // watchtower icon
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
        case 790011334:
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
                size: claimName.startsWith('Large ') ? 2 : 1,
                // TODO grab building_desc and use function level to determine cave tier
                tier: Math.max(1, categories.Cave.indexOf(localState.buildingDescriptionId))
            }, localState.location!));
            break;
        // dungeons
        case 1785852446:
        case 208697589:
        case 1084069097:
        case 846734170: // alpha jakyl dungeon, icon is smaller
        case 1385919449: // ancient overgrown mine
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

// Convert ARGB number to hex color string (e.g., #RRGGBB)
function argbToHex(argb: bigint | number): string {
    // ARGB format: 0xAARRGGBB
    const num = typeof argb === 'bigint' ? Number(argb) : argb;
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
    color?: string; // Fill color (color2)
    outlineColor?: string; // Outline color (color1)
}

// Convert a chunk index to chunk_x, chunk_z
export function chunkIndexToXZ(chunk_index: bigint): { chunk_x: number, chunk_z: number } {
    const n = BigInt(chunk_index);
    const base = n - BigInt(1);
    const chunk_z = Number(base / BigInt(1000));
    const chunk_x = Number(base % BigInt(1000));
    return {chunk_x, chunk_z};
}

// Convert chunk_x, chunk_z to tile coordinates (bottom-left corner)
export function chunkXZToTileCoords(chunk_x: number, chunk_z: number): { x: number, z: number } {
    return {x: chunk_x * 96, z: chunk_z * 96};
}

// Create an outline polygon for a chunk group by tracing its outer boundary and holes
// Returns an array of rings: [outerBoundary, hole1, hole2, ...] in GeoJSON Polygon format
function createChunkGroupOutline(chunkGroup: ChunkGroup): number[][][] {
    if (chunkGroup.chunks.length === 0) return [];

    // Create a set of all chunks for quick lookup
    const chunkSet = new Set(chunkGroup.chunks.map(c => `${c.chunk_x},${c.chunk_z}`));

    // Find all edge segments (segments on the boundary of the group)
    const edges = new Map<string, { x0: number, z0: number, x1: number, z1: number }>();

    for (const chunk of chunkGroup.chunks) {
        const {x: x0, z: z0} = chunkXZToTileCoords(chunk.chunk_x, chunk.chunk_z);
        const {x: x1, z: z1} = chunkXZToTileCoords(chunk.chunk_x + 1, chunk.chunk_z + 1);

        // Check each of the 4 edges of this chunk
        // Top edge
        if (!chunkSet.has(`${chunk.chunk_x},${chunk.chunk_z + 1}`)) {
            const key = `${x0},${z1}-${x1},${z1}`;
            edges.set(key, {x0, z0: z1, x1, z1});
        }
        // Bottom edge
        if (!chunkSet.has(`${chunk.chunk_x},${chunk.chunk_z - 1}`)) {
            const key = `${x0},${z0}-${x1},${z0}`;
            edges.set(key, {x0, z0, x1, z1: z0});
        }
        // Right edge
        if (!chunkSet.has(`${chunk.chunk_x + 1},${chunk.chunk_z}`)) {
            const key = `${x1},${z0}-${x1},${z1}`;
            edges.set(key, {x0: x1, z0, x1, z1});
        }
        // Left edge
        if (!chunkSet.has(`${chunk.chunk_x - 1},${chunk.chunk_z}`)) {
            const key = `${x0},${z0}-${x0},${z1}`;
            edges.set(key, {x0, z0, x1: x0, z1});
        }
    }

    const edgeList = Array.from(edges.values());
    if (edgeList.length === 0) return [];

    // Trace all loops (there may be multiple if there are holes)
    const loops: number[][][] = [];
    const used = new Set<number>();

    while (used.size < edgeList.length) {
        // Find an unused edge to start a new loop
        let startIdx = -1;
        for (let i = 0; i < edgeList.length; i++) {
            if (!used.has(i)) {
                startIdx = i;
                break;
            }
        }
        if (startIdx === -1) break;

        const loop: number[][] = [];
        let current = edgeList[startIdx];
        used.add(startIdx);
        loop.push([current.x0, current.z0]);
        loop.push([current.x1, current.z1]);

        // Trace this loop until we return to the start
        let maxIterations = edgeList.length;
        while (maxIterations-- > 0) {
            const lastPoint = loop[loop.length - 1];
            let found = false;

            for (let i = 0; i < edgeList.length; i++) {
                if (used.has(i)) continue;
                const edge = edgeList[i];

                // Check if this edge connects to the last point
                if (edge.x0 === lastPoint[0] && edge.z0 === lastPoint[1]) {
                    loop.push([edge.x1, edge.z1]);
                    used.add(i);
                    found = true;
                    break;
                } else if (edge.x1 === lastPoint[0] && edge.z1 === lastPoint[1]) {
                    loop.push([edge.x0, edge.z0]);
                    used.add(i);
                    found = true;
                    break;
                }
            }

            if (!found) break;
        }

        // Close the loop
        if (loop.length > 0) {
            loop.push([loop[0][0], loop[0][1]]);
            loops.push(loop);
        }
    }

    if (loops.length === 0) return [];
    if (loops.length === 1) return loops;

    // Find the outer boundary (largest perimeter) and separate from holes
    let outerIdx = 0;
    let largestPerimeter = 0;
    for (let i = 0; i < loops.length; i++) {
        let perimeter = 0;
        for (let j = 0; j < loops[i].length - 1; j++) {
            const dx = loops[i][j + 1][0] - loops[i][j][0];
            const dz = loops[i][j + 1][1] - loops[i][j][1];
            perimeter += Math.sqrt(dx * dx + dz * dz);
        }
        if (perimeter > largestPerimeter) {
            largestPerimeter = perimeter;
            outerIdx = i;
        }
    }

    // Return [outerBoundary, ...holes] - GeoJSON Polygon format
    const result = [loops[outerIdx]];
    for (let i = 0; i < loops.length; i++) {
        if (i !== outerIdx) {
            result.push(loops[i]);
        }
    }
    return result;
}

// Group a list of chunk indices into contiguous groups
export function groupContiguousChunkIndices(chunkIndices: bigint[]): ChunkGroup[] {
    const coords = chunkIndices.map(idx => ({...chunkIndexToXZ(idx), chunk_index: idx}));
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
        const group: ChunkGroup = {chunks: []};
        visit(c.chunk_x, c.chunk_z, group);
        if (group.chunks.length > 0) groups.push(group);
    }
    return groups;
}

// --- Build Watchtower Territories ---
function buildWatchtowerTerritories(claimStates: ClaimState[], localStateMap: Map<bigint, ClaimLocalState>, globalData: GlobalData): WatchtowerTerritory[] {
    // Map from watchtower entityId to all its chunk indices
    const watchtowerChunks = new Map<bigint, bigint[]>();
    const watchtowerEmpires = new Map<bigint, EmpireState>();
    globalData.empireChunkState.forEach(state => {
        if (!watchtowerChunks.has(state.watchtowerEntityId)) {
            watchtowerChunks.set(state.watchtowerEntityId, []);
        }
        const arr = watchtowerChunks.get(state.watchtowerEntityId);
        if (arr) arr.push(state.chunkIndex);
        if (!watchtowerEmpires.has(state.watchtowerEntityId)) {
            const empire = globalData.empireState.find(e => e.entityId === state.empireEntityId);
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

            // Get empire colors from globalData
            let fillColor: string | undefined;
            let outlineColor: string | undefined;
            if (empire) {
                const emblem = globalData.empireEmblemState.find(e => e.entityId === empire.entityId);
                if (emblem) {
                    // color2 for fill
                    const colorDesc2 = globalData.empireColorDesc.find(c => c.id === emblem.color2Id);
                    if (colorDesc2) {
                        fillColor = argbToHex(colorDesc2.colorArgb);
                    }
                    // color1 for outline
                    const colorDesc1 = globalData.empireColorDesc.find(c => c.id === emblem.color1Id);
                    if (colorDesc1) {
                        outlineColor = argbToHex(colorDesc1.colorArgb);
                    }
                }
            }

            territories.push({
                entityId: claimState.ownerBuildingEntityId,
                location: localState.location!,
                name: formatTemplateArgs(claimState.name),
                ownerId: empire ? empire.entityId : BigInt(0),
                ownerName: empire ? empire.name : 'Unknown',
                chunkIndices,
                chunkGroups,
                totalChunks: chunkIndices.length,
                color: fillColor || '#808080', // fallback to gray if no color found
                outlineColor: outlineColor || '#000000' // fallback to black if no color found
            });
        }
    });
    return territories;
}

async function main() {
    const LIVE = false;
    let data, globalData;
    if (LIVE) {
        // read live data
        let regions = Array.from({length: 25}, (_, i) => i + 1).filter(i => i > 5 && i < 20 && i % 5 != 0 && (i - 1) % 5 != 0).map(i => 'bitcraft-live-' + i);
        data = await fetchDataFromRegions(regions);
        globalData = await fetchGlobalData();
        fs.writeFileSync(path.join('data.json'), JSON.stringify(data, bigIntReplacer, 2));
        fs.writeFileSync(path.join('global-data.json'), JSON.stringify(globalData, bigIntReplacer, 2));
    } else {
        // or read from file for faster dev without hitting servers
        data = JSON.parse(fs.readFileSync(path.join('data.json'), 'utf-8'), bigIntReviver) as RegionData;
        globalData = JSON.parse(fs.readFileSync(path.join('global-data.json'), 'utf-8'), bigIntReviver) as GlobalData;
    }

    const localStateMap = new Map<bigint, ClaimLocalState>();
    data.claimLocalState.forEach(state => {
        localStateMap.set(state.entityId, state);
    });

    // Build all watchtower territories
    const territories = buildWatchtowerTerritories(data.claimState, localStateMap, globalData);

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
    const regionNames = (data.worldRegionNameState || []).map(r => ({id: r.id, name: r.playerFacingName}));
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
        properties: {noPan: 1, color: "#737070", weight: 0.4, opacity: 1},
        geometry: {type: "MultiLineString", coordinates: gridLines}
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
        properties: {noPan: 1, color: "#000000", weight: 2, opacity: 1},
        geometry: {type: "MultiLineString", coordinates: regionBorders}
    });
    // Add tooltips for the 9 central regions (3x3 in the center)
    for (let rz = minRegion; rz <= maxRegion; ++rz) {
        for (let rx = minRegion; rx <= maxRegion; ++rx) {
            const regionIdx = rz * regionCount + rx + 1;
            const region = regionNames.find(r => r.id === regionIdx);
            if (region) {
                outputs.grids.push({
                    type: "Feature",
                    properties: {type: "tooltip", noPan: 1, popupText: region.name},
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
    write('grids', {type: "FeatureCollection", features: outputs.grids});
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

