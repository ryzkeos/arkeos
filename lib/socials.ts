import type { SiteSettings } from "./types";

export type Social = { label: string; href: string };

export const SOCIAL_LINKS = [
  { key: "social_github", label: "GitHub" },
  { key: "social_instagram", label: "Instagram" },
  { key: "social_facebook", label: "Facebook" },
  { key: "social_linkedin", label: "LinkedIn" },
  { key: "social_telegram", label: "Telegram" },
  { key: "social_threads", label: "Threads" },
  { key: "social_discord", label: "Discord" },
] as const;

function http_url(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "https://placeholder.invalid");
    return u.protocol === "http:" || u.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export const getSocials = (s: SiteSettings): Social[] => {
  const out: Social[] = [];
  for (const { key, label } of SOCIAL_LINKS) {
    const href = http_url(s[key]);
    if (href) out.push({ label, href });
  }
  return out;
};
