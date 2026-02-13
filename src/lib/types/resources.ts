export interface ResourceEntry {
	tier: number;
	name: string;
	tag?: string;
	color?: string;
}

export interface CreatureEntry {
	tier: number;
	name: string;
	tag: string;
	color?: string;
}

export type ResourceIndex = Record<string, ResourceEntry>;
export type CreatureIndex = Record<string, CreatureEntry>;
