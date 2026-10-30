# Arkeos Web

Creative web and motion studio website, built with Next.js.

## About

Arkeos Web is the public website and admin panel for the Arkeos studio. It shows the studio's work, services, story and a contact form, with a dark, motion heavy design (smooth scroll, page transitions, custom cursor, scroll animations).

It started as a static HTML site and was rebuilt in Next.js and React with TypeScript.

- Pages: home, projects, services, about, contact, and a custom 404
- Admin panel at `/admin`: read inquiries, manage projects and services, set studio availability, edit site settings, view basic analytics
- Data: Supabase (database, auth and file storage)
- Animation: GSAP, Lenis and vanilla-tilt

## Installation

Requirements: Node.js 20 or newer and a Supabase project.

```bash
git clone https://github.com/arkeos-kzenon/arkeos-web.git
cd arkeos-web
npm install
cp .env.example .env.local
```

Open `.env.local` and set:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project url |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable (anon) key. Never use a service role key here |
| `NEXT_PUBLIC_SITE_URL` | the public site url, used for share previews |

Expected Supabase tables: `site_settings`, `projects`, `services`, `inquiries`, `analytics`, and a storage bucket named `media`. Turn on row level security for all of them.

## Usage

```bash
npm run dev      # development server on http://localhost:3000
npm run build    # production build
npm run start    # run the production build
```

Project layout:

```
app/(site)/      public pages and shared layout
app/admin/       admin page and its own styles
components/      UI pieces, animation and admin panels
hooks/           scroll and page animations
lib/             supabase client, data and helpers
styles/          page styles, scoped per page
public/assets/   images and fonts
```

Deploy to Vercel (or any Node host) and add the same environment variables there.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Ported from the original static site in the `web-projects` repository
- Fonts: Bebas Neue and DM Sans (Google Fonts)
- Libraries: Next.js, React, GSAP, Lenis, vanilla-tilt, Supabase

## Version history

- v0.1 (2026-10-31): first Next.js and React version. All pages, admin panel and Supabase integration ported from the static site.
