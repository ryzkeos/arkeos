"use client";
import Link from "next/link";
import { safeUrl } from "@/lib/gsap";
import { getIdentity } from "@/lib/content";
import { useSiteSettings } from "./SiteSettings";

export default function Footer() {
  const s = useSiteSettings();
  const { name } = getIdentity(s);
  const socials = [
    { label: "GitHub", href: safeUrl(s.social_github) },
    { label: "Instagram", href: safeUrl(s.social_instagram) },
    { label: "Facebook", href: safeUrl(s.social_facebook) },
  ].filter((x): x is { label: string; href: string } => Boolean(x.href));
  return (
    <footer role="contentinfo">
      <span className="ft-copy" suppressHydrationWarning>© {new Date().getFullYear()} {name}. All rights reserved.</span>
      {socials.length > 0 && (
        <nav className="ft-socials" aria-label="Social links">
          {socials.map(({ label, href }) => (
            <a key={label} href={href} aria-label={`${name} on ${label}`} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ))}
        </nav>
      )}
      <Link href="/privacy" className="ft-policy" aria-label="Privacy Policy">Privacy Policy</Link>
    </footer>
  );
}
