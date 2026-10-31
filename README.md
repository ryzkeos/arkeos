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
defaults/        default text and fallback content, one file per page
db/              schema.sql
hooks/           scroll and page animations
lib/             data layer, content helpers, types
styles/          page styles, scoped per page
public/assets/   images and fonts
```

### Media

Project cards play video and render `.html` media (sandboxed) automatically, and show images as is. Service cards show their image all the time and play video or render html on hover. Media is stored in the storage bucket, not in the repo. Static files that ship with the site (fonts, og image) live in `public/assets/`.

### Content

The database is the source of truth for projects, services and settings. The `defaults/` folder holds the default text and fallback lists. When the database has content it wins, otherwise `defaults/` is used. If both are empty the section is hidden or shows a short empty state.

### Copy system

Every text on the site comes from `defaults/` (one file per page, plus `shared.ts`) and can be overridden in the admin under Website Info.

- Storage: one `site_settings` row per page, key `copy_<page>` (`copy_shared`, `copy_home`, `copy_projects`, `copy_services`, `copy_about`, `copy_contact`, `copy_privacy`, `copy_not_found`). The value is JSON with the shape of that page's defaults, holding only the changed fields.
- Resolution order: `copy_<page>` override, then the legacy key (`studio_name`, `tagline`, `contact_email`, `response_time`, `founded_year`, `hero_headline`, `hero_deco`, `cta_text`, `what_intro`, `work_intro`, `about_story`, `about_stats`, `about_values`, `process_steps`, `team`, `about_image`, `about_image_wide`), then the default. Empty string, empty list and null count as not set.
- Overrides are validated against the defaults: wrong types and unknown keys are dropped, links must be relative, http(s), mailto or tel, and text is rendered as text only.
- Tokens: `{name}`, `{year}`, `{founded_year}` are replaced by `fill_vars`.
- In a component: `const copy = useCopy("home")`. Do not hardcode visible text.

### Shared resources

Check this list before creating a new helper or component.

- `defaults/index.ts`: `DEFAULTS`, `PAGE_KEYS`, and the copy types.
- `defaults/types.ts`: `LinkCopy`, `HeroCopy`, `SectionCopy`, `PageKey`, `Defaults` and one type per page.
- `defaults/<page>.ts`: default text for each page (`shared`, `home`, `projects`, `services`, `about`, `contact`, `privacy`, `not_found`).
- `lib/copy.ts`: `COPY_SETTING_KEY`, `mergeCopy`, `getCopy`, `fill_vars`, `get_vars`, `safe_href`.
- `lib/use_copy.ts`: `useCopy(page)` and `useCopyVars()`.
- `components/hero/HeroLayout.tsx`: the shared hero for every page (`variant` "full" or "page").
- `components/hero/use_hero_intro.ts`: the hero intro animation.
- `styles/hero.css`: all hero css (`.hero-*` classes).
- `components/PageHero.tsx`: thin wrapper over `HeroLayout` for older call sites.
- `components/SectionHeader.tsx`: section label, title lines, intro and right aligned button.
- `styles/section_header.css`: css for `SectionHeader`.
- `components/Btn.tsx`, `SectionH2.tsx`, `SocialIcons.tsx`, `CinemaMedia.tsx`, `SiteSettings.tsx` (`useSiteSettings`): kept as is.
- `components/admin/copy/copy_schema.ts`: `CopyField`, `COPY_SCHEMA`, `PAGE_LABELS`.
- `components/admin/copy/schema/<page>.ts`: editable fields for each page.
- `components/admin/copy/CopyEditor.tsx`: generic admin form built from the schema.
- `components/admin/WebsiteInfoPanel.tsx`: the Website Info tab.

### Data layer

The app only imports from `lib/db`. `lib/db/adapter.ts` is the current adapter. It talks to a PostgREST style REST api with token auth and object storage (currently Supabase). To use another backend, add a new adapter file with the same exports and switch the re-export in `lib/db/index.ts`.

Tables: `projects`, `services`, `site_settings`, `inquiries`, `analytics`.

`site_settings` keys: `copy_<page>` (see Copy system), `studio_name`, `founded_year`, `contact_email`, `response_time`, `tagline`, `cta_text`, `about_story`, `hero_headline`, `hero_deco`, `about_image`, `about_image_wide`, `about_stats`, `about_values`, `process_steps`, `team`, `social_github`, `social_instagram`, `social_facebook`, `hero_video`, `accent_color`, `availability`, `font_display`, `font_ui_regular`, `font_ui_medium`, `font_label`.

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
