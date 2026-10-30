"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { sbLoadSiteSettings, sbRestoreSession, sbTrackPageView } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

const Ctx = createContext<SiteSettings>({});
export const useSiteSettings = () => useContext(Ctx);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const pathname = usePathname();

  useEffect(() => {
    sbRestoreSession();
    sbLoadSiteSettings()
      .then((s) => {
        setSettings(s);
        if (s.accent_color && /^#[0-9a-fA-F]{3,6}$/.test(s.accent_color)) {
          document.documentElement.style.setProperty("--color-accent", s.accent_color);
        }
      })
      .catch(() => {}); // public pages fail silently
  }, []);

  useEffect(() => {
    sbTrackPageView(pathname);
  }, [pathname]);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}
