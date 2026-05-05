#!/usr/bin/env npx tsx
/**
 * Fetches resource_desc.json and enemy_desc.json from the BitCraft GameData repo
 * and overwrites the resourceIndex and creatureIndex in resource-index.ts.
 */

import * as fs from 'fs';
import * as path from 'path';

const RESOURCE_URL = 'https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/cereal/cs/static/resource_desc.json';
const ENEMY_URL = 'https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/cereal/cs/static/enemy_desc.json';

const TARGET_FILE = path.resolve(__dirname, '../src/lib/data/resource-index.ts');

interface ResourceDescEntry {
    id: number;
    tier?: number;
    name?: string;
    tag?: string;
    [key: string]: unknown;
}

function buildIndexBlock(
    entries: ResourceDescEntry[],
    varName: string,
    typeName: string,
    comment: string
): string {
    const lines: string[] = [];
    lines.push(`export const ${varName}: ${typeName} = { // ${comment}`);
    for (const entry of entries) {
        const id = entry.id;
        if (id === undefined || id === null) continue;
        lines.push(`    "${id}": {`);
        if (entry.tier !== undefined) lines.push(`        tier: ${entry.tier},`);
        if (entry.name !== undefined) lines.push(`        name: ${JSON.stringify(entry.name)},`);
        if (entry.tag !== undefined) lines.push(`        tag: ${JSON.stringify(entry.tag)}`);
        lines.push(`    },`);
    }
    lines.push(`};`);
    return lines.join('\n');
}

async function main() {
    console.log('Fetching resource_desc.json...');
    const resourceResp = await fetch(RESOURCE_URL);
    if (!resourceResp.ok) throw new Error(`Failed to fetch resource_desc: ${resourceResp.status}`);
    const resourceData: ResourceDescEntry[] = await resourceResp.json();

    console.log('Fetching enemy_desc.json...');
    const enemyResp = await fetch(ENEMY_URL);
    if (!enemyResp.ok) throw new Error(`Failed to fetch enemy_desc: ${enemyResp.status}`);
    const enemyData: ResourceDescEntry[] = await enemyResp.json();
    enemyData.forEach(o => o['id'] = o['enemy_type'] as number); // enemy_desc uses enemy_type as the ID field

    console.log(`Loaded ${resourceData.length} resources, ${enemyData.length} enemies`);

    const resourceBlock = buildIndexBlock(resourceData, 'resourceIndex', 'ResourceIndex', 'Generated array');
    const creatureBlock = buildIndexBlock(enemyData, 'creatureIndex', 'CreatureIndex', 'Generated array');

    // Read current file and replace the two generated blocks
    let fileContent = fs.readFileSync(TARGET_FILE, 'utf-8');

    // Replace resourceIndex block
    fileContent = replaceBlock(fileContent, 'resourceIndex', resourceBlock);
    // Replace creatureIndex block
    fileContent = replaceBlock(fileContent, 'creatureIndex', creatureBlock);

    fs.writeFileSync(TARGET_FILE, fileContent, 'utf-8');
    console.log('Updated', TARGET_FILE);
}

function replaceBlock(fileContent: string, varName: string, newBlock: string): string {
    // Match from `export const <varName>: ... = {` to the matching closing `};`
    const startMarker = `export const ${varName}: `;
    const startIdx = fileContent.indexOf(startMarker);
    if (startIdx === -1) throw new Error(`Could not find ${varName} in file`);

    // Find opening brace
    const openBrace = fileContent.indexOf('{', startIdx);
    if (openBrace === -1) throw new Error(`Could not find opening brace for ${varName}`);

    // Walk to find matching closing brace
    let depth = 0;
    let endIdx = -1;
    for (let i = openBrace; i < fileContent.length; i++) {
        if (fileContent[i] === '{') depth++;
        else if (fileContent[i] === '}') {
            depth--;
            if (depth === 0) {
                endIdx = i;
                break;
            }
        }
    }
    if (endIdx === -1) throw new Error(`Could not find closing brace for ${varName}`);

    // Include the trailing semicolon if present
    let blockEnd = endIdx + 1;
    if (fileContent[blockEnd] === ';') blockEnd++;

    return fileContent.slice(0, startIdx) + newBlock + fileContent.slice(blockEnd);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
