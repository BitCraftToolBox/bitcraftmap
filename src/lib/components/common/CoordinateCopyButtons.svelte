<script lang="ts">
	import { Check, Link } from '@lucide/svelte';
	import ChatIcon from '$lib/components/icons/ChatIcon.svelte';
	import {
		buildChatCoordinateLink,
		buildCoordinateViewUrl,
		type CoordinateView
	} from '$lib/utils/coordinate-links';

	let {
		getCoordinateView,
		iconClass = 'size-3.5 sm:size-4 text-gray-400',
		buttonClass = 'shrink-0 p-0.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer'
	}: {
		getCoordinateView: () => CoordinateView | null;
		iconClass?: string;
		buttonClass?: string;
	} = $props();

	let copiedUrl = $state(false);
	let copiedChat = $state(false);

	function toggleCopied(which: 'url' | 'chat'): void {
		if (which === 'url') {
			copiedUrl = true;
			setTimeout(() => (copiedUrl = false), 1500);
		} else {
            copiedChat = true;
            setTimeout(() => (copiedChat = false), 1500);
        }
	}

	async function copyViewLink(): Promise<void> {
		const view = getCoordinateView();
		if (!view || !navigator.clipboard) return;
		await navigator.clipboard.writeText(buildCoordinateViewUrl(view));
		toggleCopied('url');
	}

	async function copyChatLink(): Promise<void> {
		const view = getCoordinateView();
		if (!view || !navigator.clipboard) return;
		await navigator.clipboard.writeText(buildChatCoordinateLink(view));
		toggleCopied('chat');
	}
</script>

<div class="flex items-center gap-1">
	<button
		onclick={copyViewLink}
		class={buttonClass}
		aria-label="Copy link to current view"
		title={copiedUrl ? 'Copied!' : 'Copy website link to coordinates'}
	>
		{#if copiedUrl}
			<Check class="size-3.5 sm:size-4 text-green-400" />
		{:else}
			<Link class={iconClass} />
		{/if}
	</button>
	<button
		onclick={copyChatLink}
		class={buttonClass}
		aria-label="Copy chat link to current location"
		title={copiedChat ? 'Copied!' : 'Copy in-game chat link to coordinates'}
	>
		{#if copiedChat}
			<Check class="size-3.5 sm:size-4 text-green-400" />
		{:else}
			<ChatIcon class={iconClass} />
		{/if}
	</button>
</div>
