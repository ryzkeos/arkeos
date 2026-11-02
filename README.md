# Arkeos Web

Company website and project portfolio of Arkeos.

## About

This is the website for Arkeos, my small studio that builds websites, apps and motion work. It is our company site and my portfolio in one place. Visitors can look through our projects and services, read about the studio, and get in touch to start a project.

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
- Media files that are replaced or removed are cleaned up from storage.
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

- Added robots.txt and a sitemap that list the public pages and keep private routes out of search.
- Added Vercel Web Analytics, which is cookieless and works with the existing content security policy.

### v1.4 (2026-11-02)

- Mobile layout pass: fixed height card descriptions that scroll, one row footer social icons that shrink to fit, project list buttons beside the tags, and service price and icon at the top right of each card.
- Moved the mobile menu availability to the top, made the social icons span the full width and kept the header visible while the menu is open.
- Services and Contact heroes now fill the screen, all projects show in the Projects page cards and list, and the section buttons are hidden on mobile in Services and About.
- Home shows featured projects first, then fills the rest with other projects.
- The preloader can no longer go past 100 percent, and videos now retry when they stall or pause.
- Fixed zoom on the Contact inputs on mobile.
- Hid the featured block unless a project is featured.
- The hero video is skipped on Data Saver or reduced motion.
- After the intro finishes, the site prefetches the other pages and warms up their images and videos in the background. It skips media on slow connections and Data Saver.

### v1.5 (2026-11-02)

- Lighter menu, header and page grain, smoother cursor, and shorter reveal delays on every page, including the About team photos.
- Videos keep playing while scrolled out of view, pause in hidden tabs and are released when leaving a page. Html media runs only while visible.
- Videos load lazily and the preloader waits only for media near the first screen.
- Videos are compressed before upload and cached for a year, with a storage config script for Supabase.

### v1.6 (2026-11-02)

- Smoother mobile menu: the header glass fades instead of switching off, the page grain hides while the menu is open and mobile toolbar resizes no longer refresh scroll animations.
- The header logo now uses the animated logo mark. It plays once after the intro, then stays still.
- The hero title glow is no longer cut off at the edges of each line once the intro finishes.
- Added a small loading ring on videos, html media and images, so a stalled or returning video shows why it stopped.

### v1.7 (2026-11-02)

- Projects page shows 10 cards first, with a Load more button and a "Showing 10 of 24" line. New cards come from memory, so there are no extra requests.
- Project card and list videos now share a play limit: 10 on desktop, 6 on phones and 4 on low memory devices. The videos closest to the screen play, the farthest pause first, and videos far from the screen are unloaded.
- New video uploads also save a small first frame image next to the video. Project videos show it while loading or after they are unloaded, and list videos skip loading until hovered. Older videos have no image and behave as before. Deleting a project or replacing a video removes its image too.
- Cards show a still frame on Data Saver or reduced motion. The featured carousel still plays only its current slide.
