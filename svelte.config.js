import adapter from '@sveltejs/adapter-auto';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

function getAdapter() {
	if (isVercel) {
		return adapter();
	}
	return isProduction ? adapterCloudflare() : adapter();
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: getAdapter()
	}
};

export default config;
