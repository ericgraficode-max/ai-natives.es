# AI Native — Digital Agency Website

A modern, animated website for a digital agency built with Astro. Features a CMS, contact form, video support, and scroll animations.

## Tech Stack

- **Astro** — Static site generator
- **Tailwind CSS** — Styling
- **GSAP** — Scroll-triggered animations
- **Sanity** — Headless CMS (optional)
- **Formspree** — Contact form backend

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## Configuration

### 1. Contact Form (Formspree)

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50 submissions/month)
2. Create a new form and copy the form ID
3. Create `.env`:

```
PUBLIC_FORMSPREE_ID=your_form_id
```

### 2. CMS (Sanity) — Optional

To enable the visual CMS for editing content:

1. Create a project at [sanity.io](https://sanity.io)
2. Add to `.env`:

```
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
```

3. Run `npm run dev` and visit `/admin` to access Sanity Studio
4. Create content: Hero, Services, Projects in the CMS

Without Sanity, the site uses built-in placeholder content.

### 3. Video & Rich Assets

- **With Sanity**: Upload videos and images in the CMS (Hero, Projects)
- **Without Sanity**: Place files in `public/` and reference them (e.g. `/video.mp4`)

## Deploy to Hostinger

1. **Build** the site:
   ```bash
   npm run build
   ```

2. **Upload** the `dist/` folder contents to your Hostinger `public_html` via:
   - File Manager (hPanel)
   - FTP client (FileZilla, etc.)

3. **Point your domain** to the uploaded files.

### Deployment Checklist

- [ ] Set `PUBLIC_FORMSPREE_ID` before building (or update the form action in `ContactForm.astro`)
- [ ] Set `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` if using CMS
- [ ] Add CORS origins in Sanity dashboard for your production URL (if using CMS)

## Project Structure

```
├── public/          # Static assets
├── sanity/           # Sanity schema definitions
├── src/
│   ├── components/   # Reusable components
│   ├── layouts/      # Page layouts
│   ├── lib/          # Sanity client, utilities
│   ├── pages/        # Routes
│   └── styles/       # Global CSS
└── dist/             # Build output (upload to Hostinger)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
