import { unstable_cache } from "next/cache";
import { dbLoadSiteSettings } from "@/lib/db";
import { fetch_projects, fetch_services, parse_settings } from "./content";
import type { ContentSeed } from "./content_seed";
import type { SiteSettings } from "./types";

export const CONTENT_REVALIDATE = 60;

const options = { revalidate: CONTENT_REVALIDATE, tags: ["content"] };

const cached_settings = unstable_cache(dbLoadSiteSettings, ["arkeos-settings"], options);
const cached_projects = unstable_cache(fetch_projects, ["arkeos-projects"], options);
const cached_services = unstable_cache(fetch_services, ["arkeos-services"], options);

const or_undefined = async <T>(run: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await run();
  } catch {
    return undefined;
  }
};

export async function load_settings(): Promise<SiteSettings> {
  const raw = await or_undefined(cached_settings);
  return parse_settings(raw) ?? {};
}

export async function load_seed(): Promise<ContentSeed> {
  const [settings, projects, services] = await Promise.all([
    or_undefined(cached_settings),
    or_undefined(cached_projects),
    or_undefined(cached_services),
  ]);
  return {
    settings: parse_settings(settings) ?? undefined,
    projects,
    services,
  };
}
