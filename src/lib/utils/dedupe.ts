export function filterUnique<T>(array: T[]): T[] {
	const seen = new Set<string>();
	const result: T[] = [];
	for (const item of array) {
		const serialized = JSON.stringify(item);
		if (!seen.has(serialized)) {
			seen.add(serialized);
			result.push(item);
		}
	}
	return result;
}
