import {ClaimLocalState, ClaimState, DbConnection, EmpireChunkState} from './bindings/src'
import * as fs from "node:fs";
import * as path from "node:path";

fs.existsSync('.env.local') && require('dotenv').config({path: '.env.local'});
const data_dir = process.env.DATA_DIR || "../frontend/assets/markers/";
!fs.existsSync(data_dir) && fs.mkdirSync(data_dir, {recursive: true});

interface RegionData {
    claimState: ClaimState[],
    claimLocalState: ClaimLocalState[],
    empireChunkState: EmpireChunkState[]
}

interface OutputData {
    towers: any[];
    caves: any[],
    trees: any[],
    ruined: any[],
    temples: any[],
    dungeons: any[]
}

const categories = {
    'Wonder': [433549604],
    'Temple': [489406613, 1752479333, 1662809355, 2034914963, 1008368350],
    'Cave': [1845065396, 280863630, 696858550, 1440765680, 312420794, 1875067311, 253216585, 1477951340],
    'Dungeon': [1785852446, 846734170, 208697589, 1084069097],
    'RuinedTown': [292245080],
    'Ruins': [1441436391, 1842388176], // we don't use these right now. usually people just track the resource nodes instead
    'Watchtower': [90000]
}

// Color palette: visually distinct colors
const COLOR_PALETTE = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
    '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3',
    '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000',
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

const onConnect = (resolve: (_: RegionData) => void) =>
    (conn: DbConnection) => {
        const subs = [
            'SELECT * FROM claim_state',
            'SELECT * FROM claim_local_state',
            'SELECT * FROM empire_chunk_state'
        ];
        conn.subscriptionBuilder().onApplied(() => {
            const data: RegionData = {
                claimState: Array.from(conn.db.claimState.iter()),
                claimLocalState: Array.from(conn.db.claimLocalState.iter()),
                empireChunkState: Array.from(conn.db.empireChunkState.iter())
            };
            conn.disconnect();
            resolve(data);
        }).subscribe(subs);
    };

async function fetchDataFromRegions(regions: string[]) {
    const data: RegionData = {
        claimState: [],
        claimLocalState: [],
        empireChunkState: []
    }

    for (const region of regions) {
        const res = await new Promise<RegionData>((resolve, reject) => {
            DbConnection.builder()
                .withUri('wss://' + process.env.BITCRAFT_SPACETIME_HOST)
                .withModuleName(region)
                .withToken(process.env.BITCRAFT_BEARER_TOKEN)
                .onConnect(onConnect(resolve))
                .onConnectError((_, err) => {
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

function makeTower(claimState: ClaimState, localState: ClaimLocalState, chunkIndices: bigint[], watchtowerGroups, groupColorMap) {
    const props = {
        popupText: formatTemplateArgs(claimState.name),
    };
    if (!chunkIndices || chunkIndices.length === 0) {
        return {
            type: "FeatureCollection",
            features: [
                makeFeature(props, localState.location)
            ]
        };
    }
    // decompose chunk indices into chunk coordinates
    const chunkCoords = chunkIndices.map(idx => {
        const n = BigInt(idx);
        const base = n - BigInt(1);
        const chunk_z = Number(base / BigInt(1000));
        const chunk_x = Number(base % BigInt(1000));
        return {chunk_x, chunk_z};
    });
    // For each chunk, create a rectangle polygon in tile coordinates
    const polygons: number[][][] = chunkCoords.map(({chunk_x, chunk_z}) => {
        const x0 = chunk_x * 96;
        const x1 = (chunk_x + 1) * 96;
        const z0 = chunk_z * 96;
        const z1 = (chunk_z + 1) * 96;
        // Rectangle corners, closed
        return [
            [x0, z0],
            [x1, z0],
            [x1, z1],
            [x0, z1],
            [x0, z0]
        ];
    });
    // Find the group for this tower
    let fillColor = COLOR_PALETTE[0];
    if (watchtowerGroups && groupColorMap) {
        // Find the group(s) for this tower
        for (const g of watchtowerGroups) {
            if (g.entityId === claimState.ownerBuildingEntityId) {
                fillColor = groupColorMap.get(g) || fillColor;
                break;
            }
        }
    }
    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    fillOpacity: 0.2,
                    fillColor
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: polygons.map(p => [p])
                }
            },
            makeFeature(props, localState.location)
        ]
    };
}

function addFeature(outputs: OutputData, claimState: ClaimState, localState: ClaimLocalState, watchtowerChunks: Map<bigint, bigint[]>, watchtowerGroups, groupColorMap) {
    const claimName = formatTemplateArgs(claimState.name);
    switch (localState.buildingDescriptionId) {
        case 433549604: // Tree of Wisdom
            outputs.trees.push(makeFeature({
                name: claimName,
                type: 'tree'
            }, localState.location));
            break;
        // Temples
        case 489406613:
        case 1752479333:
        case 1662809355:
        case 2034914963:
        case 1008368350:
            outputs.temples.push(makeFeature({
                name: claimName
            }, localState.location));
            break;
        // Ruined Town
        case 292245080:
            outputs.ruined.push(makeFeature({
                name: claimName
            }, localState.location));
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
            }, localState.location));
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
            }, localState.location));
            break;
        // watchtower
        case 90000:
            outputs.towers.push(makeTower(claimState, localState, watchtowerChunks.get(claimState.ownerBuildingEntityId), watchtowerGroups, groupColorMap));
            break;
    }
}

async function main() {
    let regions = Array.from({length: 25}, (_, i) => i + 1).filter(i => i > 5 && i < 20 && i % 5 != 0 && (i - 1) % 5 != 0).map(i => 'bitcraft-live-' + i);

    const data = await fetchDataFromRegions(regions);

    const localStateMap = new Map<bigint, ClaimLocalState>();
    data.claimLocalState.forEach(state => {
        localStateMap.set(state.entityId, state);
    });

    // Build all watchtower groups for coloring
    const watchtowerGroups = [];
    const watchtowerChunks = new Map<bigint, bigint[]>();
    data.empireChunkState.forEach(state => {
        if (!watchtowerChunks.has(state.watchtowerEntityId)) {
            watchtowerChunks.set(state.watchtowerEntityId, []);
        }
        watchtowerChunks.get(state.watchtowerEntityId).push(state.chunkIndex);
    });
    data.claimState.forEach(claimState => {
        const localState = localStateMap.get(claimState.entityId);
        if (localState && localState.buildingDescriptionId === 90000) {
            // decompose chunk indices into chunk coordinates
            const chunkIndices = watchtowerChunks.get(claimState.ownerBuildingEntityId);
            if (chunkIndices && chunkIndices.length > 0) {
                const chunkCoords = chunkIndices.map(idx => {
                    const n = BigInt(idx);
                    const base = n - BigInt(1);
                    const chunk_z = Number(base / BigInt(1000));
                    const chunk_x = Number(base % BigInt(1000));
                    return {chunk_x, chunk_z};
                });
                // Group contiguous chunks
                const groups = groupContiguousChunks(chunkCoords);
                groups.forEach(group => {
                    watchtowerGroups.push({entityId: claimState.ownerBuildingEntityId, group});
                });
            }
        }
    });
    // Assign colors
    const groupColors = assignWatchtowerColors(watchtowerGroups);

    // Map from group index to color
    const groupColorMap = new Map();
    watchtowerGroups.forEach((g, i) => {
        groupColorMap.set(g, COLOR_PALETTE[groupColors[i] % COLOR_PALETTE.length]);
    });

    const outputs: OutputData = {
        caves: [],
        trees: [],
        ruined: [],
        temples: [],
        dungeons: [],
        towers: []
    }

    // For each claim, add features
    data.claimState.map(claimState => {
        const localState = localStateMap.get(claimState.entityId);
        addFeature(outputs, claimState, localState, watchtowerChunks, watchtowerGroups, groupColorMap);
    });

    function write(name: string, features: any[]) {
        fs.writeFileSync(path.join(data_dir, name + '.geojson'), JSON.stringify(features));
    }
    write('caves', outputs.caves);
    write('trees', outputs.trees);
    write('ruined', outputs.ruined);
    write('temples', outputs.temples);
    write('dungeons', outputs.dungeons);
    write('towers', outputs.towers);
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

// Helper: get all chunk keys for a group
function chunkGroupKeys(group) {
    return new Set(group.map(c => `${c.chunk_x},${c.chunk_z}`));
}

// Helper: check if two groups are neighbors (share an edge)
function areGroupsNeighbors(groupA, groupB) {
    const setA = chunkGroupKeys(groupA);
    for (const {chunk_x, chunk_z} of groupB) {
        for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1]]) {
            if (setA.has(`${chunk_x+dx},${chunk_z+dz}`)) return true;
        }
    }
    return false;
}

// Group contiguous chunks
function groupContiguousChunks(chunkCoords: {chunk_x: number, chunk_z: number}[]): {chunk_x: number, chunk_z: number}[][] {
    const groups: {chunk_x: number, chunk_z: number}[][] = [];
    const visited = new Set<string>();
    const chunkSet = new Set(chunkCoords.map(c => `${c.chunk_x},${c.chunk_z}`));

    function visit(x: number, z: number, group: {chunk_x: number, chunk_z: number}[]) {
        const key = `${x},${z}`;
        if (visited.has(key) || !chunkSet.has(key)) return;
        visited.add(key);
        group.push({chunk_x: x, chunk_z: z});
        [[x - 1, z], [x + 1, z], [x, z - 1], [x, z + 1]].forEach(([nx, nz]) => {
            visit(nx, nz, group);
        });
    }

    for (const coord of chunkCoords) {
        const key = `${coord.chunk_x},${coord.chunk_z}`;
        if (visited.has(key)) continue;
        const newGroup: {chunk_x: number, chunk_z: number}[] = [];
        visit(coord.chunk_x, coord.chunk_z, newGroup);
        if (newGroup.length > 0) {
            groups.push(newGroup);
        }
    }
    return groups;
}

// Assign colors to all watchtower groups so that neighbors have different colors
function assignWatchtowerColors(watchtowerGroups) {
    // Build adjacency list
    const n = watchtowerGroups.length;
    const adj: Set<number>[] = Array.from({length: n}, () => new Set<number>());
    for (let i = 0; i < n; ++i) {
        for (let j = i+1; j < n; ++j) {
            if (areGroupsNeighbors(watchtowerGroups[i].group, watchtowerGroups[j].group)) {
                adj[i].add(j);
                adj[j].add(i);
            }
        }
    }
    // Greedy coloring
    const colors = Array(n).fill(-1);
    for (let i = 0; i < n; ++i) {
        const used = new Set(Array.from(adj[i]).map((j: number) => colors[j]));
        for (let c = 0; c < COLOR_PALETTE.length; ++c) {
            if (!used.has(c)) {
                colors[i] = c;
                break;
            }
        }
        if (colors[i] === -1) colors[i] = 0; // fallback
    }
    return colors;
}
