import type { Metadata, Viewport } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(raw || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "ARKEOS",
  description: "ARKEOS official website.",
  openGraph: {
    type: "website",
    siteName: "ARKEOS",
    title: "ARKEOS",
    images: ["/assets/img/og.webp"],
  },
  twitter: { card: "summary_large_image" },
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
        <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      </head>
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
