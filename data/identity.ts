import type { ProcessStep, StatItem, ValueItem } from "@/lib/types";

export type StaticIdentity = {
  name?: string;
  tagline?: string;
  email?: string;
  responseTime?: string;
  foundedYear?: number;
  heroHeadline?: string;
  heroDeco?: string;
  aboutImage?: string;
  aboutImageWide?: string;
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
