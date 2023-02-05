/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,}', './src/index.css'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      zinc: {
        ...colors.zinc,
        850: '#202023',
      },
      rose: {
        ...colors.rose,
        450: '#F85872',
      },
      accent: {
        1: colors.orange['400'],
        2: colors.cyan['400'],
        3: colors.emerald['500'],
      },
    },
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
