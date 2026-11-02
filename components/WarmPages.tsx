"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { dbPublicUrl } from "@/lib/db";
import { projects_store, services_store } from "@/lib/content_store";
import { safeUrl } from "@/lib/gsap";
import { media_kind } from "@/lib/media_type";
import { useIntroDone } from "@/lib/preloader";
import { useCopy } from "@/lib/use_copy";
import { use_store } from "@/lib/use_store";
import { useSiteSettings } from "./SiteSettings";

const ROUTES = ["/", "/projects", "/services", "/about", "/contact", "/privacy"];
const MEDIA_MAX = 12;
const VIDEO_WAIT_MS = 8000;

type Connection = { saveData?: boolean; effectiveType?: string };

function connection_ok() {
  const c = (navigator as Navigator & { connection?: Connection }).connection;
  if (!c) return true;
  if (c.saveData) return false;
  return !["slow-2g", "2g", "3g"].includes(c.effectiveType ?? "");
}

function pick_image(value?: string): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("/") ? raw : dbPublicUrl("", raw);
}

function warm_image(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function warm_video(url: string) {
  return new Promise<void>((resolve) => {
    const el = document.createElement("video");
    el.muted = true;
    el.preload = "metadata";
    const release = () => {
      window.clearTimeout(timer);
      el.removeAttribute("src");
      el.load();
      resolve();
    };
    const timer = window.setTimeout(release, VIDEO_WAIT_MS);
    el.addEventListener("loadeddata", release, { once: true });
    el.addEventListener("error", release, { once: true });
    el.src = url.includes("#") ? url : `${url}#t=0.001`;
  });
}

async function warm_media(urls: string[], done: Set<string>, stopped: () => boolean) {
  for (const url of urls) {
    if (stopped()) return;
    const kind = media_kind(url);
    if (kind === "video") await warm_video(url);
    else if (kind === "image") await warm_image(url);
    done.add(url);
  }
}

function when_idle(fn: () => void) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 3000 });
  else window.setTimeout(fn, 800);
}

export default function WarmPages() {
  const router = useRouter();
  const pathname = usePathname();
  const intro_done = useIntroDone();
  const settings = useSiteSettings();
  const about = useCopy("about");
  const projects = use_store(projects_store).data;
  const services = use_store(services_store).data;
  const warmed = useRef(new Set<string>());

  useEffect(() => {
    if (!intro_done || pathname.startsWith("/admin")) return;
    ROUTES.filter((r) => r !== pathname).forEach((r) => {
      try { router.prefetch(r); } catch {}
    });
  }, [intro_done, pathname, router]);

  useEffect(() => {
    if (!intro_done || pathname.startsWith("/admin")) return;
    if (!projects || !services || !connection_ok()) return;

    const candidates = [
      ...projects.map((p) => safeUrl(p.media)),
      ...services.map((s) => safeUrl(s.cinema_url)),
      ...services.map((s) => safeUrl(s.icon_url)),
      pick_image(about.about_image),
      pick_image(about.about_image_wide),
      safeUrl(settings.hero_video),
    ];
    const urls = candidates
      .filter((u): u is string => !!u && !warmed.current.has(u))
      .slice(0, MEDIA_MAX);
    if (urls.length === 0) return;

    let stop = false;
    when_idle(() => {
      if (!stop) void warm_media(urls, warmed.current, () => stop);
    });
    return () => { stop = true; };
  }, [intro_done, pathname, projects, services, settings.hero_video, about.about_image, about.about_image_wide]);

  return null;
}
