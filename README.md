# ARKEOS Web

Crafting web experiences and motion work that demand attention and refuse to be forgotten.

## About

ARKEOS Web is the official website of ARKEOS, a small independent studio that designs and builds websites, apps and motion work with privacy as the starting point.

The site shows who the studio is, what it offers and what it has made, and gives visitors a simple way to start a project. The owner runs everything from a built in admin panel, with no code changes needed.

**For visitors**

- A showcase of finished projects with images, video and live previews
- A clear list of services and a step by step view of how the studio works
- The studio story, values, team and numbers
- A contact form, with the current availability shown on every page
- A privacy page that states exactly what data is collected

**For the owner**

- Add and edit projects and services, with media uploads
- Edit page text, brand details, social links, colors and fonts
- Read inquiries and see basic visit stats
- Switch availability between taking projects and booked

Only real content is shown. Sections with nothing to show stay hidden.

## Installation

Requirements: Node.js 20 or newer, and a database with a REST api (Supabase works).

```bash
git clone https://github.com/ryzkeos/arkeos-web.git
cd arkeos-web
npm install
cp .env.example .env.local
```

1. Fill in `.env.local` with the database url, the public key and the site url. Use the public key only, never a secret key.
2. Run `db/schema.sql` in the database sql editor. It is safe to run again after updates.

## Usage

```bash
npm run dev
```

Open `http://localhost:3000` for the site and `/admin` for the admin panel.

For production, run `npm run build` then `npm run start`. Deploy to Vercel or any Node host with the same environment variables.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Visual inspiration: Pinterest, and the creators who share their work there. All rights to the original works stay with their owners.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis

## Version history

- v0.1 (2026-10-31): first version with all pages and the admin panel.
- v0.2 (2026-10-31): content loaded from the database, no placeholder content, privacy page.
- v0.3 (2026-11-01): projects page with featured carousel and card or list view, services media rows and animated process flow, full width section header media.
- v0.3.1 (2026-11-01): files upload only after a project or service is saved, smoother loading of cards and media, safer html media, admin form fixes.
- v0.3.2 (2026-11-01): README rewritten around the project purpose, Pinterest credit added.
