# Arkeos Web

Company website and project portfolio of Arkeos.

## About

This is the website for Arkeos, my small studio that builds websites, apps and motion work. It is our company site and my portfolio in one place. Visitors can look through our projects and services, read about the studio, and get in touch to start a project.

It also shows what I can do as a web developer. Every page is custom built, with its own layouts, animations and media, from the Home page to the Contact form.

Projects, services and page text are stored in a database, so updates don't need a code change, and a section with nothing to show stays hidden. The site also shows whether we are taking new projects.

Pages: Home, Projects, Services, About, Contact and Privacy.

## Media and performance

- Videos are compressed in the browser when uploaded from the admin: capped at 1280 px wide, audio removed, h264 with fast start, saved as mp4. If the result is not clearly smaller, or compression fails, the original is uploaded. The compressor files are copied to `public/ffmpeg` on install and loaded only when a video is chosen.
- Uploads are stored with a one year cache header. Links carry a `?v=` stamp, so a reupload always shows the new file.
- Videos load lazily: they play only while on screen and in an active tab, pause when scrolled away, and are released when you leave the page. Html media follows the same rule.
- Run `db/storage_config.sql` once in the Supabase SQL editor to set the bucket size limit and allowed file types. On other hosts, serve videos with range requests, long cache headers and a CDN in front.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Design inspiration: Pinterest. Credits to the original creators of the pins.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis, Upstash Redis

## Version history

### v0.1 (2026-10-30)

- Ported the project to Next.js and React.
- Made the Home, Projects, About, Services and Contact pages data driven, with safe project links.
- Connected the header, footer and call to action to the site settings.
- Added the Privacy page.
- Shortened the preloader, set neutral page metadata and sized the grids to their content.

### v0.2 (2026-10-31)

- Content now loads from the database. The sample projects and team were removed and an empty fallback was added.
- Added custom fonts from validated urls, then bundled local fonts.
- Moved data access into its own layer and added a database schema with access rules, constraints and storage policies. It can also create the tables from scratch.
- Added security headers and a content security policy.
- Added a protected contact form with a honeypot, rate limiting and input cleanup.
- Made the hero headline and decoration data driven, added hero and About images, a hero video and full height page heroes.
- Added a preloader based on real resource loading, shown once per session.
- Added a sharper cursor, a full screen mobile menu and social icons.
- Shortened the page transition so it never blocks link clicks, and made accent colors follow the theme color.
- Added weekly dependency updates.

### v0.3 (2026-10-31)

- Moved all site text into a defaults folder with merge logic, so every page reads its text from one place.
- Added a shared hero and section header for every page.
- Connected Services, About, Privacy, the 404 page, Contact, Home and Projects to the shared text.
- Added bento style project cards with image, video and html media, grouped layouts for one to five cards, and details that reveal every five seconds.
- Added a featured carousel with auto swipe and a card or list switch on the Projects page.
- Added service rows with image, video or html media, plus an animated process flow on the Services page.
- Made the section header media span the full width.
- Added a contact call to action with media shapes behind the headline.
- Removed the unused pillars feature.

### v0.4 (2026-11-01)

- Reworked the call to action into a four wall corridor with a blended headline, entry drift, scroll parallax and an idle float.
- Gave the Projects page a full height hero and a wider featured description.
- Redesigned the process section on the Services page as a connected timeline.
- Made About use the same numbers as Home and gave it a longer story.
- Polished the Contact page with line style inputs, a custom select modal and a centered success state.
- Cached database content in the browser so pages render right away, then refresh in the background.
- Extended the section header media over the section padding with an edge fade.
- Redesigned the service cards and the core value cards, and added a shared left to right hover sweep for buttons.
- Moved Projects above Services on Home, removed the price tag from the Home service cards and removed buttons from sections that do not need them.
- Fixed the Services page animations so section labels stay visible.

### v0.5 (2026-11-01)

- Image, video and html media are now detected from the file extension everywhere.
- Files upload only after saving, and replaced, removed or cancelled files are cleaned up.
- Html media renders in a sandboxed frame, and video is forced muted with a first frame.
- Removed the gray block before cards animate in and put black behind media while it loads.
- Reduced the Projects page to a single section with the featured carousel on top.
- Added a full data reset script and removed unused tables and fields from the schema.

### v1.0 (2026-11-01)

- First stable release.
- Rewrote the README and added the Pinterest credit.
- Removed the dependency update config.

### v1.1 (2026-11-01)

- Moved the contact form rate limit to Upstash Redis so it works across serverless instances on Vercel.
- Added a fallback limiter for local development when Upstash is not set up.

### v1.2 (2026-11-01)

- Page titles now follow the Arkeos | Page format.
- Added the Arkeos logo as the browser tab icon and the phone home screen icon.
- Added the animated logo SVG.
- Added the logo mark beside the name in the header.

### v1.3 (2026-11-02)

- Added robots.txt and a sitemap that list the public pages and keep admin and api out of search.
- Added Vercel Web Analytics, which is cookieless and works with the existing content security policy.

### v1.4 (2026-11-02)

- After the intro finishes, the site prefetches the other pages and warms up their images and videos in the background. It skips media on slow connections and Data Saver.

### v1.5 (optimization)

- Lighter menu, header and page grain, smoother cursor, and shorter reveal delays on every page.
- Videos and html media play only while visible and stop when leaving a page.
- Video uploads are compressed and cached, with storage config added.
