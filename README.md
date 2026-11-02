# Arkeos Web

Company website and project portfolio of Arkeos.

## About

This is the website for Arkeos, my small studio that builds websites, apps and systems. It is our company site and my portfolio in one place. Visitors can look through our projects and services, read about the studio, and get in touch to start a project.

It also shows what I can do as a web developer. Every page is custom built, with its own layouts, animations and media, from the Home page to the Contact form.

Projects, services and page text are stored in a database, so updates don't need a code change, and a section with nothing to show stays hidden. The site also shows whether we are taking new projects.

Pages: Home, Projects, Services, About, Contact and Privacy.

## Credits

- Author: Arkeos (ryzkeos)
- Published: October 31, 2026
- Design inspiration: Pinterest. Credits to the original creators of the pins.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis, Upstash Redis

## Version History

### v0.1 (2026-10-30) Next.js Port

- Moved the site to Next.js and React with the app router, one route per page.
- Home, Projects, About, Services and Contact render from data (HomeView, ProjectsView, AboutView, ServicesView). Project links pass a safe url check.
- Header, footer and call to action read the site settings. Added the Privacy page.
- Neutral page metadata, a shorter preloader and grids sized to their content.

### v0.2 (2026-10-31) Database Content

- Removed the sample projects and team. Added an empty fallback in defaults.
- Added content loaders and hooks (lib/content.ts, useContent) and a settings loaded flag in SiteSettings.
- Moved data access to lib/db/adapter.ts with its own env names, plus upsert, count and inquiry post.
- Hero headline, ghost word and About images now come from data.

### v0.3 (2026-10-31) Custom Fonts

- SiteSettings injects woff2 font faces from urls checked against the storage origin.
- Bundled local fonts in globals.css and added a noscript fallback.

### v0.4 (2026-10-31) Database Schema

- db/schema.sql is repeatable and sets up tables, row level security, constraints and storage policies. It can create the tables from scratch.

### v0.5 (2026-10-31) Security Headers

- next.config.mjs sets security headers and a content security policy built from env values.
- Private routes are noindex, env files are ignored and an empty or invalid site url is tolerated (layout.tsx).

### v0.6 (2026-10-31) Contact Form Protection

- app/api/inquiry/route.ts validates every field, adds a honeypot and a rate limit, and strips control characters.

### v0.7 (2026-10-31) Real Loading Preloader

- usePreloadProgress measures real resource loading instead of a timer.
- Preloader shows once per session on any entry page (lib/preloader.ts).

### v0.8 (2026-10-31) Hero Rework

- PageHero is full height with the same top padding as Home. Added the hero video setting.
- Home headline and ghost word are data driven. Added the scroll chevron, flicker animation, scattered glow and hover reveal word (HomeView, home.css).

### v0.9 (2026-10-31) Cursor, Menu And Transition

- Cursor.tsx is a sharper, smaller reticle.
- Header has a zip style menu button and a full screen mobile overlay with icon socials (SocialIcons).
- PageTransition is shorter and never blocks link clicks.

### v0.10 (2026-10-31) Accent Follows Theme

- Accent tints in globals.css and about.css follow the theme color setting.

### v0.11 (2026-10-31) Project Cards

- ProjectCard, ProjectGrid and ProjectMedia render bento cards with image, video and html media.
- Grouped layouts for one to five cards and a 2:1 solo card.
- Details reveal every five seconds (use_card_peek). Tags scroll with an inline call to action.

### v0.12 (2026-10-31) Service Media

- ServiceCard and ServiceRow show image, video or html media (CinemaMedia, use_cinema_active). Media is always visible and plays on hover.
- Removed the unused pillars feature (types, loaders, db functions).

### v0.13 (2026-10-31) Shared Text System

- Moved all site text into defaults/ with merge logic (lib/copy.ts) and a use_copy hook.
- Wired Home, Projects, Services, About, Contact, Privacy, 404 and the shell components to it.

### v0.14 (2026-10-31) Shared Hero And Section Header

- HeroLayout and use_hero_intro give every page the same hero.
- SectionHeader gives every section the same header with a default intro and buttons.

### v0.15 (2026-10-31) Projects Featured Carousel

- ProjectFeatured swipes every five seconds. ProjectRow and ProjectsMore add the cards and list switch.
- The Projects page is one section with the carousel on top at 2:1, a full height hero and a wider featured description.

### v0.16 (2026-11-01) Section Header Media

- Header media spans the full width, extends over the section padding and fades at the edges (section_header.css).

### v0.17 (2026-11-01) Call To Action Corridor

- CtaSection frames image, video or html media as a four wall corridor behind the headline, with a difference blend on the letters.
- Added entry drift, scroll parallax and an idle float.

### v0.18 (2026-11-01) Services Process Timeline

- ProcessFlow is a connected timeline with its own animation (services.css).

### v0.19 (2026-11-01) About Numbers And Values

- About uses the same counters as Home and a longer story.
- Core value cards have a new hover animation (about.css).

### v0.20 (2026-11-01) Contact Page Polish

- ContactView has line style inputs, equal field heights and a readable send button.
- SelectModal replaces the native select. The success state is centered with a square check icon.

### v0.21 (2026-11-01) Browser Content Cache

- lib/cache.ts keeps database content in local storage. content_store and use_store render cached data first, then refresh in the background.

### v0.22 (2026-11-01) Service Cards And Button Sweep

- Redesigned the service cards on Home and Services (ServiceCard, ServiceRow).
- Added a shared left to right hover sweep in globals.css for buttons, service cards and value cards.

### v0.23 (2026-11-01) Home Section Order

- Projects now come before Services on Home (HomeView). The price tag is removed from the Home service cards.

### v0.24 (2026-11-01) Section Labels And Buttons

- Section header buttons reveal on every page (useArkeosAnimations).
- Services animations run once so section labels stay visible.
- Removed buttons from sections that do not need them.

### v0.25 (2026-11-01) Media Type From File Extension

- lib/media_type.ts detects image, video or html from the file extension. CinemaMedia, ProjectMedia, SectionHeader and CtaSection use it, and the manual media type fields are gone.

### v0.26 (2026-11-01) Media Storage Cleanup

- Replaced or removed media files are deleted from storage only after the save succeeds, and cancelled uploads are cleaned up (media_tx.ts).
- Files upload after their row is saved. One backup is kept per upload slot.

### v0.27 (2026-11-01) Html Media Sandbox

- HtmlFrame renders html media in a sandboxed srcdoc frame.
- Video is forced muted and shows a first frame.

### v0.28 (2026-11-01) No Gray Block

- Removed the gray block before cards animate and put black behind media while it loads (globals, home, about, projects and service_card css).

### v0.29 (2026-11-01) Data Reset Script

- db/reset.sql wipes the content and keeps user accounts.
- Removed the unused pillars table and cinema_type from the schema.

### v1.0 (2026-11-01) First Stable Release

- Rewrote the README around the project purpose and added the Pinterest credit.
- Removed the dependency update config.

### v1.1 (2026-11-01) Shared Rate Limit

- lib/rate_limit.ts uses Upstash Redis so the contact form limit works across serverless instances. A local limiter is the fallback when Upstash is not set up.

### v1.2 (2026-11-01) Page Title Format

- Page titles in layout.tsx and each page follow the Arkeos | Page format.

### v1.3 (2026-11-01) Logo Branding

- Added the animated logo svg, the browser tab icon (icon.svg, favicon.ico) and the phone home screen icon (apple-icon.png).
- LogoMark sits beside the name in Header.

### v1.4 (2026-11-02) Robots And Sitemap

- app/robots.ts and app/sitemap.ts list the public pages and keep private routes out of search.

### v1.5 (2026-11-02) Web Analytics

- Added Vercel Web Analytics in layout.tsx. It is cookieless and works with the content security policy.

### v1.6 (2026-11-02) Mobile Layout Pass

- Cards have fixed height descriptions that scroll. Footer socials fit one row. List buttons sit beside the tags. Service price and icon sit at the top right.
- The mobile menu shows availability first and full width socials, and the header stays visible while it is open.
- Services and Contact heroes fill the screen. The Projects page shows every project in cards and list. Section buttons are hidden on Services and About.
- Fixed input zoom on Contact (contact.css).

### v1.7 (2026-11-02) Featured Projects

- Home shows featured projects first, then fills the rest (HomeView).
- The Projects page hides the featured block unless a project is featured. Removed the unused featured title and intro fields.

### v1.8 (2026-11-02) Preloader And Video Keepalive

- usePreloadProgress can no longer pass 100 percent.
- use_video_keepalive retries videos that stall or pause, and videos preload eagerly.

### v1.9 (2026-11-02) Data Saver Hero Video

- use_motion_allowed lets HeroLayout skip the hero video on Data Saver or reduced motion.

### v1.10 (2026-11-02) Page Warmup

- WarmPages prefetches the other pages after the intro and warms their images and videos in the background. It skips media on slow connections and Data Saver.

### v1.11 (2026-11-02) Lighter Interface

- Lighter menu, header and page grain, a glass header, a smoother cursor and shorter reveal delays on every page (globals.css, Cursor, AboutView).

### v1.12 (2026-11-02) Lazy Media

- Video and html media load lazily. The preloader waits only for media near the first screen.
- Videos keep playing while scrolled out of view, pause in hidden tabs and are released when leaving a page (use_video_keepalive). Html media runs only while visible.

### v1.13 (2026-11-02) Video Compression On Upload

- video_compress.ts compresses videos in the browser before upload.
- Uploads are cached for a year. Added db/storage_config.sql for the storage bucket.

### v1.14 (2026-11-02) Mobile Menu Smoothness

- The header glass fades instead of switching off, the page grain hides while the menu is open and mobile toolbar resizes no longer refresh scroll animations (globals.css, Header).
- Restored the original menu reveal.

### v1.15 (2026-11-02) Media Loading Ring

- MediaLoader shows a small ring on videos, html media and images (CinemaMedia, HtmlFrame, MediaImage, ProjectMedia), so a stalled video shows why it stopped.

### v1.16 (2026-11-02) Animated Header Logo

- LogoMark uses the animated logo mark. It plays once after the intro, then stays still.

### v1.17 (2026-11-02) Hero Glow Clip

- The hero title glow is no longer cut off at the edges of each line once the intro ends (use_hero_intro).

### v1.18 (2026-11-02) Projects Load More

- ProjectsMore shows 10 cards first, with a Load more button and a "Showing 10 of 24" line. New cards come from memory, so there are no extra requests.

### v1.19 (2026-11-02) Shared Video Pool

- lib/video_pool.ts loads each video once and shares it across pages and views, including Services, section headers and the call to action (use_pooled_video).
- A shared video shows in one place at a time and the other place shows its first frame. An unused video is released after 30 seconds.
- Html media on cards loads only near the screen (use_near_screen). Background warming skips videos on phones, low memory devices and Data Saver.

### v1.20 (2026-11-02) Video Play Budget

- video_budget.ts limits playing videos on the Projects page to 10 on desktop, 6 on phones and 4 on low memory devices. The closest videos play, the farthest pause first and far videos are unloaded.
- Videos that may not play do not download ahead. Cards show a still frame on Data Saver or reduced motion, and the featured carousel plays only its current slide.

### v1.21 (2026-11-02) Video Posters

- video_poster.ts saves a small first frame image next to each uploaded video. It shows while a video loads or after it is unloaded.
- poster_backfill.ts creates missing ones for older videos on projects, services, hero and section headers. Deleting or replacing a video removes its image.

### v1.22 (2026-11-02) Image Resize On Upload

- image_compress.ts resizes images wider than 1600 px and saves them as WebP.

### v1.23 (2026-11-02) Hero Video Restart

- The shared hero video restarts from the beginning with a short black fade each time a page opens (HeroLayout, hero.css).

### v1.24 (2026-11-02) Stuck Video Retry

- video_pool rechecks video placement every half second and retries a video that fails to start, so project videos no longer stay on the loading ring after leaving the page and coming back.

### v1.25 (2026-11-02) Shared Video Return Fix

- Videos turned black with an endless ring after Projects to Services and back, because leaving a page emptied the shared video. use_video_keepalive no longer empties it, and video_pool reloads a pooled video that lost its file.

### v1.26 (2026-11-02) Owner Only Write Access

- Only the site owner account can change content, read inquiries and analytics, or upload media. Any other signed in account has visitor access (schema.sql).
- Sign in checks the account type and shows the normal invalid login message for accounts without access.

### v1.27 (2026-11-02) Strict Form And Tracking Rules

- The insert rules for the contact form and page view tracking check every field at the database, so direct requests with oversized, malformed or unexpected values are rejected (schema.sql).

### v1.28 (2026-11-02) PostCSS Patch

- Pinned PostCSS to the patched version in package.json to fix a high severity issue in the build tools. No change to how the site works.

### v1.29 (2026-11-02) Upload Result Notes

- Every upload shows a short note: whether the file was compressed or resized, the size before and after or the reason it was not, and the final size (size_label.ts).
- A compressor failure shows its real error (error_text.ts).

### v1.30 (2026-11-02) Compressor Worker Files

- video_compress.ts loads its worker from the site's own files to stop the "module not found" error.
- scripts/copy_ffmpeg_core.mjs copies only the js files and stops the build with a clear error if they are missing. tsconfig.json excludes public.

### v1.31 (2026-11-02) Capital Letters On Upload Labels

- Compression and upload labels, result notes, placeholders and status text start every word with a capital letter.

### v1.32 (2026-11-02) Title Case Defaults

- Default site text uses Title Case. Short words such as to, of and the stay lowercase, and one sentence lines such as the footer rights line capitalize every word. Text with two sentences or more keeps sentence format. Saved text is not changed.

### v1.33 (2026-11-02) Higher Video Quality

- video_compress.ts limits the long side to 1920 px instead of a 1280 px width, raises quality from CRF 27 to 22 with a higher bitrate cap and never scales up. A video is still kept as the original when it is not at least 8% smaller.

### v1.34 (2026-11-02) Search Metadata

- Every page has a keyword title, a description, a canonical link and a share image (lib/site.ts). The home page adds structured data (JsonLd.tsx).
- The sitemap lists priority and update frequency. Sitemap, robots and links use NEXT_PUBLIC_SITE_URL, with https://arkeos.me as the fallback.
- Added the optional NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION setting for Google Search Console.

### v1.35 (2026-11-02) Default Contact Email

- The default contact email is ryzkeos@arkeos.me (defaults/shared.ts). A saved email still takes priority.

### v1.36 (2026-11-02) Page Titles And Descriptions

- Home is "Arkeos | Web & System Development Studio". Other pages are "Arkeos | {Page} — Web & System Works". Share titles match.
- Descriptions stress quality output, rich visuals and animations, lightweight builds and any device. The hero tagline, structured data and About text no longer center on motion work.

### v1.37 (2026-11-02) Share Image

- New og image that follows the Home hero: glowing headline, ghost name, logo and EST. 2026 line in the site fonts, in black and white with arkeos.me.

### v1.38 (2026-11-02) White Default Accent

- The default accent color is white in globals.css, the hero glow and the color presets.

### v1.39 (2026-11-02) Server Rendered Content

- lib/server_content.ts loads projects, services and settings on the server and refreshes them every minute. The site layout passes them to SiteShell through lib/content_seed.tsx.
- content_store and use_store start from that data, so the page html holds the real content and the first load has no empty flash. The browser still checks for newer content after the page opens.

### v1.40 (2026-11-02) Structured Data Without Address

- JsonLd.tsx no longer uses the local business type, which needs a street address. Arkeos is an online studio serving clients worldwide, with a contact point and the saved social links.
- Moved the social link list to lib/socials.ts so the server can use it.

### v1.41 (2026-11-02) Transparent Header Logo

- LogoMark uses a transparent png of the mark (arkeos_logo_mark.png) so the header logo has no black box on any browser. The animated svg is no longer used in the header.

### v1.42 (2026-11-03) Header Logo Black Box Fix

- The header logo still showed a black box because a global rule gave every image a black background. The header and admin logo marks now have a transparent background, so the header color shows behind the white mark.

### v1.43 (2026-11-03) Share Image Format

- The share image (og) is now a png instead of webp, so LinkedIn and chat apps show it. Added its size, type and alt text to the page tags so scrapers show it on the first share.
