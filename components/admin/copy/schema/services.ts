import type { CopyField } from "../copy_schema";

export const services_schema: CopyField[] = [
  { path: "hero.eyebrow", label: "Hero label", type: "text", max: 60 },
  { path: "hero.lines", label: "Hero title lines (one per line)", type: "lines", max: 200 },
  { path: "hero.sub", label: "Hero intro text", type: "textarea", max: 300 },
  { path: "hero.ghost", label: "Hero background word", type: "text", max: 30 },
  { path: "capabilities.label", label: "Capabilities label", type: "text", max: 60 },
  { path: "capabilities.lines", label: "Capabilities title lines (one per line)", type: "lines", max: 200 },
  { path: "process.label", label: "Process label", type: "text", max: 60 },
  { path: "process.lines", label: "Process title lines (one per line)", type: "lines", max: 200 },
  {
    path: "process_steps",
    label: "Process steps",
    type: "list",
    item_fields: [
      { path: "title", label: "Step title", type: "text", max: 60 },
      { path: "desc", label: "Step text", type: "textarea", max: 300 },
    ],
  },
  { path: "empty_text", label: "Text when no services exist", type: "text", max: 120 },
];
