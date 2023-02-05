import { defineConfig } from 'astro/config';

// https://astro.build/config
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
import preact from '@astrojs/preact';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://azzolini.io',
  integrations: [tailwind(), preact({
    compat: true
  }), mdx(), robotsTxt(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'nord'
    }
  }
});