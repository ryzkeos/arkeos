# Arkeos Web

Company website and project portfolio of Arkeos.

## About

This is the website for Arkeos, my small studio that builds websites, apps and motion work. It does two jobs. It is the company site where people can see what we offer and get in touch, and it is my portfolio, a place to show my projects and what I can do when building a website.

The site uses real content only, with no placeholders. Projects, services and page text come from a database, so I can update them without changing code, and any section with nothing in it stays hidden. It also shows whether I am taking new projects.

Pages: Home, Projects, Services, About, Contact and Privacy.

It is still a work in progress, so some things will change.

## Credits

- Author: Arkeos (arkeos-kzenon)
- Published: October 31, 2026
- Design inspiration: Pinterest. Credits to the original creators of the pins.
- Fonts: Zentry, Robert, General Sans
- Built with: Next.js, React, GSAP, Lenis

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

### v0.5.1 (2026-11-01)

- Rewrote the README and added the Pinterest credit.
- Removed the dependency update config.
