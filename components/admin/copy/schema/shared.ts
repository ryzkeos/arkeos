import type { CopyField } from "../copy_schema";

export const shared_schema: CopyField[] = [
  { path: "brand.name", label: "Studio name", type: "text", max: 40 },
  { path: "brand.tagline", label: "Tagline", type: "textarea", max: 240 },
  { path: "brand.email", label: "Contact email", type: "text", max: 120 },
  { path: "brand.response_time", label: "Response time", type: "text", max: 60 },
  { path: "brand.founded_year", label: "Founded year", type: "text", max: 4 },
  { path: "availability.available_text", label: "Availability text, open", type: "text", max: 60 },
  { path: "availability.booked_text", label: "Availability text, booked", type: "text", max: 60 },
  { path: "cta.label", label: "Call to action label", type: "text", max: 60 },
  { path: "cta.headline", label: "Call to action headline", type: "text", max: 120 },
  { path: "cta.button", label: "Call to action button", type: "text", max: 40 },
  { path: "buttons.view_all_projects", label: "Button, all projects", type: "text", max: 40 },
  { path: "buttons.view_all_services", label: "Button, all services", type: "text", max: 40 },
  { path: "buttons.view_project", label: "Button, view project", type: "text", max: 40 },
  { path: "buttons.view_project_short", label: "Button, view project (short)", type: "text", max: 20 },
  { path: "buttons.back_home", label: "Button, back to home", type: "text", max: 40 },
  { path: "hero.deco", label: "Hero corner word (max 12 characters)", type: "text", max: 12 },
  { path: "hero.hover_word", label: "Hero corner word on hover", type: "text", max: 12 },
  { path: "hero.scroll_label", label: "Scroll hint label", type: "text", max: 40 },
];
