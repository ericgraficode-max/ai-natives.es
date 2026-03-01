/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7dd3fc', // light blue
          secondary: '#a855f7', // lila / violet
          background: '#020617', // near zinc-950
        },
      },
    },
  },
  plugins: [],
};
