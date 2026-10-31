import type { CopyField } from "../copy_schema";

const section_fields = (key: string, name: string, with_cta: boolean): CopyField[] => [
  { path: `${key}.label`, label: `${name} label`, type: "text", max: 60 },
  { path: `${key}.lines`, label: `${name} title (one line per row)`, type: "lines", max: 200 },
  { path: `${key}.intro`, label: `${name} intro`, type: "textarea", max: 500 },
  ...(with_cta
    ? ([
        { path: `${key}.cta.label`, label: `${name} button label`, type: "text", max: 40 },
        { path: `${key}.cta.href`, label: `${name} button link`, type: "text", max: 300 },
      ] as CopyField[])
    : []),
];

export const home_schema: CopyField[] = [
  { path: "hero.eyebrow", label: "Hero small text. Use {founded_year}", type: "text", max: 60 },
  { path: "hero.lines", label: "Hero title (one line per row, max 3)", type: "lines", max: 120 },
  { path: "hero.sub", label: "Hero text (empty uses the studio tagline)", type: "textarea", max: 300 },
  { path: "hero.ghost", label: "Hero background word (empty uses the studio name)", type: "text", max: 30 },
  { path: "hero.cta.label", label: "Hero button label", type: "text", max: 40 },
  { path: "hero.cta.href", label: "Hero button link", type: "text", max: 300 },
  ...section_fields("what", "What we do", true),
  { path: "what_count", label: "Cards in What we do (first services shown)", type: "text", max: 2 },
  ...section_fields("work", "Selected work", true),
  { path: "work_count", label: "Projects shown on home", type: "text", max: 2 },
  ...section_fields("why", "Why us. Label can use {name}", false),
  {
    path: "why_stats",
    label: "Why us numbers (a number of 0 is counted automatically)",
    type: "list",
    item_fields: [
      { path: "n", label: "Number", type: "text", max: 6 },
      { path: "label", label: "Label", type: "text", max: 60 },
      { path: "desc", label: "Text", type: "textarea", max: 300 },
    ],
  },
];
