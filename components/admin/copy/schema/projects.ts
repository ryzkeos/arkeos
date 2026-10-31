import type { CopyField } from "../copy_schema";

export const projects_schema: CopyField[] = [
  { path: "hero.eyebrow", label: "Hero small text", type: "text", max: 60 },
  { path: "hero.lines", label: "Hero title (one line per row, max 3)", type: "lines", max: 120 },
  { path: "hero.sub", label: "Hero text", type: "textarea", max: 300 },
  { path: "hero.ghost", label: "Hero background word", type: "text", max: 30 },
  { path: "hero.cta.label", label: "Hero button label", type: "text", max: 40 },
  { path: "hero.cta.href", label: "Hero button link", type: "text", max: 300 },
  { path: "featured.label", label: "Featured label", type: "text", max: 60 },
  { path: "featured.lines", label: "Featured title lines (one per line)", type: "lines", max: 200 },
  { path: "featured.intro", label: "Featured intro text", type: "textarea", max: 500 },
  { path: "more.label", label: "More projects label", type: "text", max: 60 },
  { path: "more.lines", label: "More projects title lines (one per line)", type: "lines", max: 200 },
  { path: "more.intro", label: "More projects intro text", type: "textarea", max: 500 },
  { path: "controls.view_label", label: "Switch view group label", type: "text", max: 40 },
  { path: "controls.cards", label: "Cards view button", type: "text", max: 20 },
  { path: "controls.list", label: "List view button", type: "text", max: 20 },
  { path: "controls.previous", label: "Previous project button label", type: "text", max: 40 },
  { path: "controls.next", label: "Next project button label", type: "text", max: 40 },
  { path: "controls.go_to", label: "Slide dot label (number is added)", type: "text", max: 40 },
  { path: "empty_text", label: "Text when there are no projects", type: "text", max: 120 },
];
