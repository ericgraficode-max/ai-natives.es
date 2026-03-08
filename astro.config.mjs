// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

import node from '@astrojs/node';

const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const hasSanity = sanityProjectId && sanityProjectId !== 'placeholder';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    ...(hasSanity
      ? [
          sanity({
            projectId: sanityProjectId,
            dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
            useCdn: false,
            studioBasePath: '/admin',
          }),
        ]
      : []),
    react(),
    ],
    output: 'server',
    adapter: node({
    mode: 'standalone',
  }),
});