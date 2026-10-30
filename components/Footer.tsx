"use client";
import { safeUrl } from "@/lib/gsap";
import { useSiteSettings } from "./SiteSettings";

export default function Footer() {
  const s = useSiteSettings();
  const socials = [
    { label: "GitHub", href: safeUrl(s.social_github) },
    { label: "Instagram", href: safeUrl(s.social_instagram) },
    { label: "Facebook", href: safeUrl(s.social_facebook) },
  ];
  return (
    <footer role="contentinfo">
      <span className="ft-copy">© {new Date().getFullYear()} ARKEOS. All rights reserved.</span>
      <nav className="ft-socials" aria-label="Social links">
        {socials.map(({ label, href }) => (
          <a
            key={label}
            href={href ?? "#"}
            aria-label={`Arkeos on ${label}`}
            {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>
        ))}
      </nav>
      <a href="#" className="ft-policy" aria-label="Privacy Policy">Privacy Policy</a>
    </footer>
  );
}
