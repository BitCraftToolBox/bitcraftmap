const escapeMap: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
};

export function escapeHTML(str: string): string {
	return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}
