import type { CopyField } from "../copy_schema";

export const privacy_schema: CopyField[] = [
  { path: "label", label: "Page label", type: "text", max: 60 },
  { path: "title", label: "Page title", type: "text", max: 80 },
  { path: "updated_label", label: "Last updated label", type: "text", max: 60 },
  {
    path: "sections",
    label: "Sections",
    type: "list",
    item_fields: [
      { path: "heading", label: "Heading", type: "text", max: 80 },
      { path: "paragraphs", label: "Paragraphs (one per line)", type: "lines", max: 2000 },
    ],
  },
];
