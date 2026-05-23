# Hound | ai-native - Project Context & Guidelines

## Overview
**Hound | ai-native** is a high-performance digital growth studio website. It focuses on senior-led product design, conversion rate optimization (CRO), and engineering. The project features a custom automated "Audit Engine" used to demonstrate expertise in accessibility and digital performance.

## Tech Stack
- **Framework:** [Astro v5](https://astro.build/) (configured for SSR with Node adapter).
- **Styling:** Tailwind CSS.
- **Interactivity:** React (for complex UI like the `AuditTool`).
- **Animations:** GSAP (GreenSock) for high-end scroll and hero animations.
- **CMS:** Sanity.io (integration via `@sanity/astro`).
- **Auditing:** Playwright + @axe-core/playwright for automated site analysis.

## Project Structure
- `src/pages/`: Multi-language routes (`/`, `/de/`, `/es/`).
- `src/lib/audit-engine/`: The core logic for the automated site auditor.
  - `core/`: Browser management and screenshot logic.
  - `jobs/`: Specific audit definitions (accessibility, CRO).
  - `knowledge-base/`: Rules and benchmarks for audits.
- `src/components/`:
  - `.astro`: Server-side or static components.
  - `.tsx`: Client-side interactive React components (e.g., `AuditTool.tsx`).
- `sanity/`: Schema definitions for the Sanity Studio.

## Key Workflows & Conventions
1. **SSR First:** The project uses `output: 'server'`. API routes are located in `src/pages/api/`.
2. **Animations:** Prioritize GSAP for complex timelines. See `src/components/HeroAnimation.astro` for video + SVG + CSS animation patterns.
3. **Audit Engine:** When modifying the audit engine, ensure `src/lib/audit-engine/core/browser.ts` handles headless browser contexts correctly to avoid detection or resource leaks.
4. **Sanity Integration:** Content is fetched via `src/lib/sanity.ts`. If `PUBLIC_SANITY_PROJECT_ID` is missing, the site gracefully falls back to local placeholder content.

## Development
- **Dev Server:** `npm run dev` (starts on port 4321).
- **Environment:** Requires `.env` for Sanity and Formspree (see `.env.example`).
- **Build:** `npm run build` generates a standalone Node.js server in `dist/`.

## Architecture Notes
- The "Hound" theme (hunting for growth, precision shipping) should be reflected in UI copy and visual identity (dark mode, cyan/neon accents, high-contrast typography).
- The `AuditTool` is a key lead generation feature; it must remain performant and visually engaging.
