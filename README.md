# Arkeos Web

Portfolio site for my studio, with an admin panel to run it.

## About

This is the website for Arkeos, a small studio that builds websites, apps and motion work. I made it to show what we do, list our projects and services, and give people an easy way to reach out when they want to start something.

Everything on the site is managed from an admin page: projects, services, page text, colors, fonts and social links. That way I don't have to touch the code every time something changes. It also shows if I'm taking new projects or fully booked, and if a section has no content yet, it just stays hidden.

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

The site runs on `http://localhost:3000` and the admin is at `/admin`.

For production, run `npm run build` then `npm run start`. It works on Vercel or any Node host, just add the same environment variables there.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Design inspiration: Pinterest. Credits to the original creators of the pins.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis

## Version history

- v0.1 (2026-10-31): first version with all pages and the admin panel.
- v0.2 (2026-10-31): content now comes from the database, removed the placeholder content, added the privacy page.
- v0.3 (2026-11-01): new projects page with a featured carousel and card or list view, services page with media rows and process flow, full width section header media.
- v0.3.1 (2026-11-01): files upload only after saving, smoother loading for cards and media, safer html media, a few admin form fixes.
- v0.3.2 (2026-11-01): rewrote the README and added the Pinterest credit.
