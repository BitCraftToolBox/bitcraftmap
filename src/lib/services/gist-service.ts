const GIST_API = 'https://api.github.com/gists/';

export async function getLatestGistRaw(gistId: string): Promise<string> {
	if (!/^[a-fA-F0-9]{32}$/.test(gistId)) throw new Error('gistId is invalid');

	const gistCommits = await fetch(GIST_API + gistId + '/commits');
	if (!gistCommits.ok) throw new Error(`Failed to fetch gist commits: ${gistCommits.status}`);
	const gistCommitsJson = await gistCommits.json();
	if (!Array.isArray(gistCommitsJson) || gistCommitsJson.length === 0) {
		throw new Error('No commits found for this gist');
	}
	const lastGistCommitVersion = gistCommitsJson[0].version;

	const gistInfo = await fetch(GIST_API + gistId + '/' + lastGistCommitVersion);
	if (!gistInfo.ok) throw new Error(`Failed to fetch gist info: ${gistInfo.status}`);
	const gistInfoJson = await gistInfo.json();
	const filesNames = gistInfoJson.files || {};
	const fileKeys = Object.keys(filesNames);
	if (fileKeys.length === 0) {
		throw new Error('No files found in this gist');
	}
	const lastGistRawUrl = filesNames[fileKeys[0]].raw_url;

	const gistContentRaw = await fetch(lastGistRawUrl);
	if (!gistContentRaw.ok) throw new Error(`Failed to fetch gist content: ${gistContentRaw.status}`);
	return await gistContentRaw.text();
}
