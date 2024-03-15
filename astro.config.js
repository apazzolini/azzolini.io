import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
import preact from '@astrojs/preact';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  prefetch: false,
  site: 'https://azzolini.io',
  integrations: [
    tailwind(),
    preact({
      compat: true,
    }),
    mdx(),
    robotsTxt(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
