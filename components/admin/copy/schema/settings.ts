import type { CopyItem } from "../copy_schema";

const MEDIA_TYPES = ["image", "video", "html"];
const EMPTY_NOTE = "(empty keeps the plain outline)";

const cta_media = (slot: "a" | "b" | "c" | "d", place: string): CopyItem[] => [
  { page: "shared", section: "Media", field: { path: `cta.deco_${slot}_type`, label: `Call to action ${place} wall media type`, type: "select", options: MEDIA_TYPES } },
  { page: "shared", section: "Media", field: { path: `cta.deco_${slot}_url`, label: `Call to action ${place} wall media ${EMPTY_NOTE}`, type: "media" } },
];

export const SETTINGS_COPY_ITEMS: CopyItem[] = [
  ...cta_media("a", "left near"),
  ...cta_media("b", "right near"),
  ...cta_media("c", "left far"),
  ...cta_media("d", "right far"),
  { page: "shared", section: "Media", field: { path: "section_media.type", label: "Section header media type (shown behind every section header)", type: "select", options: MEDIA_TYPES } },
  { page: "shared", section: "Media", field: { path: "section_media.url", label: "Section header media (empty shows none)", type: "media" } },
  { page: "about", section: "Media", field: { path: "about_image", label: "About story image", type: "image" } },
  { page: "about", section: "Media", field: { path: "about_image_wide", label: "About wide image", type: "image" } },
  { page: "shared", section: "Navigation links", field: { path: "nav", label: "Navigation links", type: "links" } },
  { page: "shared", section: "Preloader statuses", field: { path: "preloader.statuses", label: "Preloader statuses (4 steps, in order)", type: "list", max: 40 } },
];
