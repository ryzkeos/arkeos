"use client";
import Link from "next/link";
import { fill_vars } from "@/lib/copy";
import { useCopy } from "@/lib/use_copy";
import { useSiteSettings } from "./SiteSettings";
import { SocialIcon, getSocials } from "./SocialIcons";

export default function Footer() {
  const s = useSiteSettings();
  const { brand, footer } = useCopy("shared");
  const name = brand.name;
  const socials = getSocials(s);
  return (
    <footer role="contentinfo">
      <span className="ft-copy" suppressHydrationWarning>
        {fill_vars(footer.rights_text, { name, year: new Date().getFullYear(), founded_year: brand.founded_year })}
      </span>
      {socials.length > 0 && (
        <nav className="ft-socials" aria-label={name}>
          {socials.map(({ label, href }) => (
            <a key={label} href={href} aria-label={`${name} ${label}`} target="_blank" rel="noopener noreferrer">
              <SocialIcon label={label} />
            </a>
          ))}
        </nav>
      )}
      <Link href="/privacy" className="ft-policy">{footer.privacy_label}</Link>
    </footer>
  );
}
