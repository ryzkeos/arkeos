# Arkeos Web

Creative web and motion studio website, built with Next.js.

## About

Arkeos Web is the public website and admin panel for a creative studio. Every project, service, team member and statistic is real content loaded from the studio's database. Nothing is hardcoded, and sections with no content stay hidden.

- Pages: home, projects, services, about, contact, privacy, and a custom 404
- Admin panel at `/admin`: read inquiries, manage projects and services, edit the studio identity, fonts and site settings, set availability, view basic analytics
- Animation: GSAP, Lenis and vanilla-tilt

## Installation

Requirements: Node.js 20 or newer and a database with a PostgREST style REST api.

```bash
git clone https://github.com/arkeos-kzenon/arkeos-web.git
cd arkeos-web
npm install
cp .env.example .env.local
```

Set these in `.env.local`:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_DATA_API_URL` | base url of the data api |
| `NEXT_PUBLIC_DATA_API_KEY` | the public anon key only. Never a secret key or a connection string |
| `NEXT_PUBLIC_STORAGE_URL` | optional. Storage base url, defaults to the data api url |
| `NEXT_PUBLIC_STORAGE_BUCKET` | optional. Bucket name, defaults to `media` |
| `NEXT_PUBLIC_SITE_URL` | the public site url, used for share previews |

Run `db/schema.sql` on the database before first use. It creates the tables and the `url` and `price` fields.

## Usage

```bash
npm run dev      # development server on http://localhost:3000
npm run build    # production build
npm run start    # run the production build
```

Project layout:

```
app/(site)/      public pages and shared layout
app/admin/       admin page
app/api/inquiry/ inquiry route used by the contact form
components/      UI pieces, animation and admin panels
data/            optional static fallback content
db/              schema.sql
hooks/           scroll and page animations
lib/             data layer, content helpers, types
styles/          page styles, scoped per page
public/assets/   images and fonts
```

### Content

The database is the source of truth. The `data/` folder is an optional static fallback and ships empty. When the database has content it wins, otherwise `data/` is used. If both are empty the section is hidden or shows a short empty state.

### Data layer

The app only imports from `lib/db`. `lib/db/adapter.ts` is the current adapter. It talks to a PostgREST style REST api with token auth and object storage (currently Supabase). To use another backend, add a new adapter file with the same exports and switch the re-export in `lib/db/index.ts`.

Tables: `projects`, `services`, `site_settings`, `inquiries`, `analytics`.

`site_settings` keys: `studio_name`, `founded_year`, `contact_email`, `response_time`, `tagline`, `cta_text`, `about_story`, `about_stats`, `about_values`, `process_steps`, `team`, `social_github`, `social_instagram`, `social_facebook`, `hero_video`, `accent_color`, `availability`, `font_display`, `font_ui_regular`, `font_ui_medium`, `font_label`.

### Fonts

Bundled fonts live in `public/assets/fonts`: Zentry, Robert (regular and medium) and General Sans. Each font slot can be overridden by an uploaded `.woff2` in the admin font panel.

### Privacy

The `/privacy` page describes the data the site collects: inquiry form fields and page view logging.

Deploy to Vercel (or any Node host) and add the same environment variables there.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Fonts: Zentry, Robert, General Sans
- Libraries: Next.js, React, GSAP, Lenis, vanilla-tilt

## Version history

- v0.1 (2026-10-31): first Next.js and React version with all pages and the admin panel.
- v0.2 (2026-10-31): content loaded from the database, no placeholder content, provider neutral data layer, privacy page.
