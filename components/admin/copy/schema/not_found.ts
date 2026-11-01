import type { CopyField } from "../copy_schema";

export const not_found_schema: CopyField[] = [
  { path: "label", label: "Label", type: "text", max: 60 },
  { path: "num", label: "Error number", type: "text", max: 10 },
  { path: "tagline", label: "Tagline", type: "text", max: 80 },
  { path: "button_label", label: "Button label", type: "text", max: 40 },
  { path: "aria_section", label: "Screen reader label: page", type: "text", max: 120 },
  { path: "aria_num", label: "Screen reader label: number", type: "text", max: 60 },
  { path: "aria_tagline", label: "Screen reader label: tagline", type: "text", max: 80 },
  { path: "aria_button", label: "Screen reader label: button", type: "text", max: 120 },
];
