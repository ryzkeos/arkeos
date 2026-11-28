# Installation

How to set up and run the Arkeos website.

## Prerequisites

- Node.js 20 or newer and npm.
- A Supabase project for the data api, the storage and the auth. The project only needs the public anon key on the client, never the service role key.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_DATA_API_URL` | the Supabase project url |
| `NEXT_PUBLIC_DATA_API_KEY` | the public anon key only, never a secret or a connection string |
| `NEXT_PUBLIC_STORAGE_URL` | the Supabase storage url |
| `NEXT_PUBLIC_STORAGE_BUCKET` | the storage bucket name, `media` by default |
| `NEXT_PUBLIC_SITE_URL` | the public site url, used by the sitemap and the robots file |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | the Google site verification token, optional |
| `UPSTASH_REDIS_REST_URL` | the Upstash Redis url for the rate limit, server only |
| `UPSTASH_REDIS_REST_TOKEN` | the Upstash Redis token, server only |

The two `UPSTASH_` values are server side only. Never prefix them with `NEXT_PUBLIC_`.

## Run

```bash
npm run dev      # http://localhost:3000
npm run build    # the production build
npm start        # serve the production build
npm run lint
```

## Checks

```bash
npm run build
npm run lint
```

## Deployment

The project builds to a static Next.js server. `next.config.ts` holds the output settings and the redirects.

The GitHub Actions workflow `.github/workflows/promote_develop_to_main.yml` promotes `develop` to `main` when the checks pass.

## Notes

- The ffmpeg core files are copied by the `postinstall` script, so run `npm install` before the first build.
- The admin pages and the inquiry api need the Supabase keys. Without them the site still renders the public pages.
- The rate limit on the inquiry form needs the Upstash values, and it stays open without them.
