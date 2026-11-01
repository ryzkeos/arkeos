import type { CopyItem } from "../copy_schema";

const EMPTY_NOTE = "(empty keeps the plain outline)";

const cta_media = (slot: "a" | "b" | "c" | "d", place: string): CopyItem[] => [
  { page: "shared", section: "Media", field: { path: `cta.deco_${slot}_url`, label: `Call to action ${place} wall media (image, video or html) ${EMPTY_NOTE}`, type: "media" } },
];

export const SETTINGS_COPY_ITEMS: CopyItem[] = [
  {
    page: "about",
    section: "Counters",
    field: {
      path: "stats_items",
      label: "Counters shown on Home and About (a number of 0 is counted automatically)",
      type: "list",
      item_fields: [
        { path: "n", label: "Number", type: "text", max: 10 },
        { path: "label", label: "Label", type: "text", max: 60 },
        { path: "desc", label: "Text", type: "textarea", max: 300 },
      ],
    },
  },
  ...cta_media("a", "left near"),
  ...cta_media("b", "right near"),
  ...cta_media("c", "left far"),
  ...cta_media("d", "right far"),
  { page: "shared", section: "Media", field: { path: "section_media.url", label: "Section header media (image, video or html, empty shows none)", type: "media" } },
  { page: "about", section: "Media", field: { path: "about_image", label: "About story image", type: "image" } },
  { page: "about", section: "Media", field: { path: "about_image_wide", label: "About wide image", type: "image" } },
  { page: "shared", section: "Navigation links", field: { path: "nav", label: "Navigation links", type: "links" } },
  { page: "shared", section: "Preloader statuses", field: { path: "preloader.statuses", label: "Four steps, in order", type: "list", max: 40 } },
];
