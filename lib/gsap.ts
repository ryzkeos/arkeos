"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/** only allow http(s) urls from remote settings. blocks javascript: and data: */
export function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "https://placeholder.invalid");
    return u.protocol === "http:" || u.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
