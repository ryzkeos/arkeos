"use client";
import { useSiteSettings } from "@/components/SiteSettings";
import { useProjects } from "@/lib/useContent";
import { useCopy } from "@/lib/use_copy";

const whole_number = (v?: string): number | null => {
  const n = Number.parseInt((v ?? "").trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function use_stat_values(): number[] {
  const settings = useSiteSettings();
  const projects = useProjects();
  const { brand } = useCopy("shared");
  const years = Math.max(1, new Date().getFullYear() - brand.founded_year + 1);
  return [
    whole_number(settings.projects_count) ?? projects?.length ?? 0,
    whole_number(settings.years_active) ?? years,
    whole_number(settings.clients_count) ?? 0,
  ];
}
