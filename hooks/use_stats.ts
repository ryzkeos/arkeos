"use client";
import { useProjects } from "@/lib/useContent";
import { useCopy } from "@/lib/use_copy";
import type { StatItem } from "@/lib/types";

export function use_stats(): StatItem[] {
  const projects = useProjects();
  const { brand } = useCopy("shared");
  const { stats_items } = useCopy("about");
  const years = Math.max(1, new Date().getFullYear() - brand.founded_year + 1);
  const auto = [projects?.length ?? 0, years, 0];
  return stats_items.map((s, i) => ({ ...s, n: s.n > 0 ? s.n : auto[i] ?? 0 }));
}
