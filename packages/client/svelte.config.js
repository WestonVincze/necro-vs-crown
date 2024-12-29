import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    alias: {
      "$UI/*": "src/UI/*",
      $icons: "src/icons",
      "$game/*": "src/game/*",
      /** this sucks but it works... */
      $entities: "../shared/src/entities/*",
      $components: "../shared/src/components/*",
      $systems: "../shared/src/systems/*",
      $data: "../shared/src/data/*",
      $relations: "../shared/src/relations/*",
      $types: "../shared/src/types/*",
      $helpers: "../shared/src/helpers/*",
      $events: "../shared/src/events/*",
      $managers: "../shared/src/managers/*",
      $constants: "../shared/src/constants/*",
      $stores: "../shared/src/stores/*",
      $utils: "../shared/src/utils/*",
      $schemas: "../shared/src/schemas/*",
    },
    adapter: adapter({
      precompress: false,
      fallback: "index.html",
    }),
  },
};

export default config;
