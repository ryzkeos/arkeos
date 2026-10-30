"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { sbLoadSiteSettings, sbRestoreSession, sbTrackPageView } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

const Ctx = createContext<SiteSettings>({});
const LoadedCtx = createContext(false);

export const useSiteSettings = () => useContext(Ctx);
export const useSiteSettingsLoaded = () => useContext(LoadedCtx);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    sbRestoreSession();
    sbLoadSiteSettings()
      .then((s) => {
        if (!active) return;
        setSettings(s);
        setLoaded(true);
        if (s.accent_color && /^#[0-9a-fA-F]{3,6}$/.test(s.accent_color)) {
          document.documentElement.style.setProperty("--color-accent", s.accent_color);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    sbTrackPageView(pathname);
  }, [pathname]);

  return (
    <Ctx.Provider value={settings}>
      <LoadedCtx.Provider value={loaded}>{children}</LoadedCtx.Provider>
    </Ctx.Provider>
  );
}
