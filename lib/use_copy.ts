"use client";
import { useMemo } from "react";
import { useSiteSettings } from "@/components/SiteSettings";
import type { Defaults, PageKey } from "@/defaults";
import { getCopy, get_vars, type CopyVars } from "./copy";

export function useCopy<K extends PageKey>(page: K): Defaults[K] {
  const settings = useSiteSettings();
  return useMemo(() => getCopy(page, settings), [page, settings]);
}

export function useCopyVars(): CopyVars {
  const settings = useSiteSettings();
  return useMemo(() => get_vars(settings), [settings]);
}
