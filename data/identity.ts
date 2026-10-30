import type { ProcessStep, StatItem, ValueItem } from "@/lib/types";

export type StaticIdentity = {
  name?: string;
  tagline?: string;
  email?: string;
  responseTime?: string;
  foundedYear?: number;
  story: string[];
  stats: StatItem[];
  values: ValueItem[];
  process: ProcessStep[];
};

export const STATIC_IDENTITY: StaticIdentity = {
  story: [],
  stats: [],
  values: [],
  process: [],
};
