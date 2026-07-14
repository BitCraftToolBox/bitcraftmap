import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Fully static site (single prerendered page + static assets), so no
    // Cloudflare Worker/Function is deployed at all - just static files.
    adapter: adapter(),
  },
};

export default config;
