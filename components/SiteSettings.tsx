"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { dbLoadSiteSettings, dbRestoreSession, dbTrackPageView } from "@/lib/db";
import type { SiteSettings } from "@/lib/types";

const Ctx = createContext<SiteSettings>({});
const LoadedCtx = createContext(false);

export const useSiteSettings = () => useContext(Ctx);
export const useSiteSettingsLoaded = () => useContext(LoadedCtx);

const UNSAFE_URL_CHARS = /["'\\()\r\n\f]/;

function safeFontUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || UNSAFE_URL_CHARS.test(value)) return null;
  try {
    const base = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_DATA_API_URL || "";
    const allowed = new URL(base).origin;
    const url = new URL(value);
    if (url.protocol !== "https:" || url.origin !== allowed) return null;
    if (UNSAFE_URL_CHARS.test(url.href)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function applyFonts(s: SiteSettings): () => void {
  const display = safeFontUrl(s.font_display);
  const regular = safeFontUrl(s.font_ui_regular);
  const medium = safeFontUrl(s.font_ui_medium);
  const label = safeFontUrl(s.font_label);

  const faces: string[] = [];
  const face = (family: string, src: string, weight?: number) =>
    faces.push(
      `@font-face{font-family:"${family}";src:url("${src}") format("woff2");${weight ? `font-weight:${weight};` : ""}font-display:swap}`
    );
  if (display) face("Arkeos Display", display);
  if (regular) face("Arkeos UI", regular, 400);
  if (medium) face("Arkeos UI", medium, 500);
  if (label) face("Arkeos Label", label);
  if (faces.length === 0) return () => {};

  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const vars: [string, string, boolean][] = [
    ["--font-display", "Arkeos Display", !!display],
    ["--font-ui", "Arkeos UI", !!regular || !!medium],
    ["--font-label", "Arkeos Label", !!label],
  ];

  const style = document.createElement("style");
  style.id = "arkeos-fonts";
  style.textContent = faces.join("");
  document.head.appendChild(style);

  const applied: string[] = [];
  for (const [name, family, active] of vars) {
    if (!active) continue;
    const existing = computed.getPropertyValue(name).trim();
    root.style.setProperty(name, existing ? `"${family}", ${existing}` : `"${family}"`);
    applied.push(name);
  }

  return () => {
    style.remove();
    applied.forEach((name) => root.style.removeProperty(name));
  };
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    let undoFonts: () => void = () => {};
    dbRestoreSession();
    dbLoadSiteSettings()
      .then((s) => {
        if (!active) return;
        setSettings(s);
        setLoaded(true);
        if (s.accent_color && /^#[0-9a-fA-F]{3,6}$/.test(s.accent_color)) {
          document.documentElement.style.setProperty("--color-accent", s.accent_color);
        }
        undoFonts = applyFonts(s);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      undoFonts();
    };
  }, []);

  useEffect(() => {
    dbTrackPageView(pathname);
  }, [pathname]);

  return (
    <Ctx.Provider value={settings}>
      <LoadedCtx.Provider value={loaded}>{children}</LoadedCtx.Provider>
    </Ctx.Provider>
  );
}
