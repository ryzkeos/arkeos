"use client";
import Link from "next/link";
import { getIdentity } from "@/lib/content";
import { useSiteSettings } from "./SiteSettings";
import { SocialIcon, getSocials } from "./SocialIcons";

export default function Footer() {
  const s = useSiteSettings();
  const { name } = getIdentity(s);
  const socials = getSocials(s);
  return (
    <footer role="contentinfo">
      <span className="ft-copy" suppressHydrationWarning>© {new Date().getFullYear()} {name}. All rights reserved.</span>
      {socials.length > 0 && (
        <nav className="ft-socials" aria-label="Social links">
          {socials.map(({ label, href }) => (
            <a key={label} href={href} aria-label={`${name} on ${label}`} target="_blank" rel="noopener noreferrer">
              <SocialIcon label={label} />
            </a>
          ))}
        </nav>
      )}
      <Link href="/privacy" className="ft-policy" aria-label="Privacy Policy">Privacy Policy</Link>
    </footer>
  );
}
