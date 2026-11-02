import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, site_url } from "@/lib/site";

const STORAGE_ORIGIN = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_DATA_API_URL;
    return raw ? new URL(raw).origin : "";
  } catch {
    return "";
  }
})();

const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const DEFAULT_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(site_url()),
  applicationName: SITE_NAME,
  title: { default: DEFAULT_TITLE, template: `${SITE_NAME} | %s` },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: DEFAULT_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
  verification: GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const NOSCRIPT_CSS =
  "#preloader,#page-overlay{display:none!important}" +
  ".reveal,.btn,.section-lbl,.cta-lbl,.page-hero__sub,#mobile-nav a{opacity:1!important;transform:none!important}" +
  ".section-h2 span em{transform:none!important}" +
  "*,*::before,*::after{cursor:auto!important}";

const SKIP_SCRIPT =
  'try{if(sessionStorage.getItem("arkeos_intro_seen")==="1")document.documentElement.setAttribute("data-intro-seen","")}catch(e){}';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {STORAGE_ORIGIN && <link rel="preconnect" href={STORAGE_ORIGIN} crossOrigin="anonymous" />}
        <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      </head>
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
