import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
