import mdx from '@mdx-js/rollup';
import React from '@vitejs/plugin-react';
import fm from 'front-matter';
import fs from 'fs';
import path from 'path';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkPrism from 'remark-prism';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import TSconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TSconfigPaths(),
    React(),
    mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm, remarkPrism] }),
    Pages({
      dirs: [
        { dir: 'content/posts', baseRoute: 'posts' },
        { dir: 'content/static', baseRoute: '' },
      ],
      extensions: ['md', 'mdx'],
      resolver: 'react',
      extendRoute(route, parent) {
        if (route.element?.endsWith('.md') || route.element?.endsWith('.mdx')) {
          const contents = fs.readFileSync(path.join('.', route.element), 'utf-8');
          const parsed = fm(contents);
          route.meta = parsed.attributes;
        }
      },
    }),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
});
