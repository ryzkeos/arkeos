"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/data";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getIdentity } from "@/lib/content";
import { useSiteSettings } from "./SiteSettings";
import { SocialIcon, getSocials } from "./SocialIcons";

export default function Header() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const { name } = getIdentity(settings);
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const socials = getSocials(settings);
  const booked = settings.availability === "booked";
  const availText = booked ? "Currently Booked" : "Now Taking Projects";

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const links = drawer.current?.querySelectorAll(".nav-ov__link");
    if (!links) return;
    document.body.style.overflow = open ? "hidden" : "";
    if (prefersReducedMotion()) gsap.set(links, { y: open ? "0%" : "110%" });
    else if (open) gsap.to(links, { y: "0%", duration: 0.6, ease: "power3.out", stagger: 0.07, delay: 0.18 });
    else gsap.to(links, { y: "110%", duration: 0.35, ease: "power2.in", stagger: 0.03 });
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div
        id="nav-overlay"
        ref={drawer}
        className={open ? "open" : ""}
        role="dialog"
        aria-label="Site navigation"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="nav-ov__inner">
          {NAV.map((n, i) => (
            <div key={n.href} className="nav-ov__row">
              <Link href={n.href} className={`nav-ov__link${isActive(n.href) ? " is-active" : ""}`} aria-current={isActive(n.href) ? "page" : undefined} tabIndex={open ? 0 : -1}>
                <span>{n.label}</span>
                <span className="nav-ov__idx">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            </div>
          ))}
        </div>
        <div className="nav-ov__foot">
          <div className="nav-ov__avail">
            <span className={`dot${booked ? " booked" : ""}`} />
            <span>{availText}</span>
          </div>
          {socials.length > 0 && (
            <nav className="nav-ov__socials" aria-label="Social links">
              {socials.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} on ${label}`} tabIndex={open ? 0 : -1}><SocialIcon label={label} /></a>
              ))}
            </nav>
          )}
        </div>
      </div>

      <header id="header" className={stuck ? "stuck" : ""} role="banner">
        <Link href="/" className="hdr-logo" aria-label={`${name} home`}>{name}</Link>

        <nav className="hdr-nav" role="navigation" aria-label="Main navigation">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "is-active" : undefined} aria-current={isActive(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hdr-badge" id="availability-badge" aria-label={`Studio availability: ${availText}`}>
          <span className={`dot${booked ? " booked" : ""}`} />
          <span id="availability-text">{availText}</span>
        </div>

        <button
          className={`hdr-nav-trigger${open ? " open" : ""}`}
          id="nav-trigger"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="nav-overlay"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-lines" aria-hidden="true"><span /><span /><span /></span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </header>
    </>
  );
}
