import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://arkeos.me";
export const SITE_NAME = "Arkeos";
export const SITE_DESCRIPTION =
  "Arkeos is a small studio offering web and system development: websites, web apps, custom software and motion design built with privacy first.";
export const SITE_KEYWORDS = [
  "Arkeos",
  "web development",
  "system development",
  "web development studio",
  "custom software development",
  "web app development",
  "website design and development",
  "motion design",
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

type PageMeta = {
  path: string;
  title: string | { absolute: string };
  share_title: string;
  description: string;
};

export function page_meta({ path, title, share_title, description }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path || "/" },
    openGraph: { type: "website", siteName: SITE_NAME, url: path || "/", title: share_title, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: share_title, description, images: [OG_IMAGE] },
  };
}
