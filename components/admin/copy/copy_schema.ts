import type { PageKey } from "@/defaults";
import { about_schema } from "./schema/about";
import { contact_schema } from "./schema/contact";
import { home_schema } from "./schema/home";
import { not_found_schema } from "./schema/not_found";
import { privacy_schema } from "./schema/privacy";
import { projects_schema } from "./schema/projects";
import { services_schema } from "./schema/services";
import { shared_schema } from "./schema/shared";

export type CopyFieldType = "text" | "textarea" | "lines" | "list" | "links" | "image" | "photo" | "media" | "select";

export type CopyField = {
  path: string;
  label: string;
  type: CopyFieldType;
  max?: number;
  item_fields?: CopyField[];
  options?: string[];
};

export const COPY_SCHEMA: Record<PageKey, CopyField[]> = {
  shared: shared_schema,
  home: home_schema,
  projects: projects_schema,
  services: services_schema,
  about: about_schema,
  contact: contact_schema,
  privacy: privacy_schema,
  not_found: not_found_schema,
};

export const PAGE_LABELS: Record<PageKey, string> = {
  shared: "Shared (header, footer, menu)",
  home: "Home",
  projects: "Projects",
  services: "Services",
  about: "About",
  contact: "Contact",
  privacy: "Privacy",
  not_found: "Page not found",
};

export const LINK_FIELDS: CopyField[] = [
  { path: "label", label: "Label", type: "text", max: 80 },
  { path: "href", label: "Link", type: "text", max: 300 },
];
