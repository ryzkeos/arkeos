import type { CopyField } from "../copy_schema";

export const projects_schema: CopyField[] = [
  { path: "hero.eyebrow", label: "Hero small text", type: "text", max: 60 },
  { path: "hero.lines", label: "Hero title (one line per row, max 3)", type: "lines", max: 120 },
  { path: "hero.sub", label: "Hero text", type: "textarea", max: 300 },
  { path: "hero.ghost", label: "Hero background word", type: "text", max: 30 },
  { path: "hero.cta.label", label: "Hero button label", type: "text", max: 40 },
  { path: "hero.cta.href", label: "Hero button link", type: "text", max: 300 },
  { path: "empty_text", label: "Text when there are no projects", type: "text", max: 120 },
];
