import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://arkeos.me";
export const SITE_NAME = "Arkeos";
export const SITE_TITLE = `${SITE_NAME} | Web & System Development Studio`;
export const SITE_DESCRIPTION =
  "Arkeos builds websites and systems with quality output, rich visuals and smooth animations. Lightweight, fast and flexible on any device, with privacy first.";
export const SITE_KEYWORDS = [
  "Arkeos",
  "web development",
  "system development",
  "web development studio",
  "custom software development",
  "web app development",
  "website design and development",
  "software development",
  "soft tech development",
];
export const OG_IMAGE = "/assets/img/og.webp";

export function site_url(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(raw || DEFAULT_SITE_URL).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const abs_url = (path = "") => `${site_url()}${path}`;

type PageMeta = { path: string; description: string };

export function page_meta({ path, description }: PageMeta): Metadata {
  return {
    title: { absolute: SITE_TITLE },
    description,
    alternates: { canonical: path || "/" },
    openGraph: { type: "website", siteName: SITE_NAME, url: path || "/", title: SITE_TITLE, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: SITE_TITLE, description, images: [OG_IMAGE] },
  };
}
