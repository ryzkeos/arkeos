# Arkeos Web

Company website and project portfolio of Arkeos.

## About

This is the website for Arkeos, my small studio that builds websites, apps and motion work. It does two jobs. It's the company site where people can see what we offer and get in touch, and it's my portfolio, a place to show my projects and what I can do when building a website.

The site uses real content only, no placeholders. Projects, services and page text come from a database, so I can update them without changing code, and any section with nothing in it stays hidden. It also shows whether I'm taking new projects.

Pages: home, projects, services, about, contact and privacy.

It's still a work in progress, so some things will change.

## Installation

You need Node.js 20 or newer and a database with a REST api. I use Supabase.

```bash
git clone https://github.com/ryzkeos/arkeos-web.git
cd arkeos-web
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your database url, the public key and your site url. Public key only, never the secret one.

Then run `db/schema.sql` in your database's sql editor. You can run it again after updates, it won't break anything.

## Usage

```bash
npm run dev
```

The site runs on `http://localhost:3000`.

For production, run `npm run build` then `npm run start`. It works on Vercel or any Node host, just add the same environment variables there.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Design inspiration: Pinterest. Credits to the original creators of the pins.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis

## Version history

- v0.1 (2026-10-30): first version. Moved the project to Next.js and React, built the home, projects, about, services and contact pages, added the privacy page, and made the content data driven.
- v0.2 (2026-10-31): content now loads from the database and the sample projects and team are gone. Added custom fonts, the database schema with access rules, security headers, and a protected contact form with spam and rate limiting. Added the hero video, a preloader based on real loading, a new cursor and a full screen mobile menu.
- v0.3 (2026-10-31): all site text moved into editable defaults with a shared hero and section header. New bento project cards, a featured carousel with card and list view on the projects page, media rows and an animated process flow on the services page, and a contact call to action with media shapes behind the headline.
- v0.4 (2026-11-01): reworked the call to action into a four wall corridor with entry drift and scroll parallax. Database content is cached in the browser and refreshed in the background. Redesigned the service cards, core value cards and button hover sweep, polished the contact page, and moved projects above services on the home page.
- v0.5 (2026-11-01): image, video and html media are now detected from the file extension everywhere. Files upload only after saving, replaced files are cleaned up, html media renders in a sandboxed frame, and loading no longer flashes gray blocks. Fixed the projects page layout with the featured carousel on top.
- v0.5.1 (2026-11-01): rewrote the README, added the Pinterest credit and removed the dependabot config.
