import type { ProjectsCopy } from "./types";

export const projects: ProjectsCopy = {
  hero: {
    eyebrow: "Selected Work",
    lines: ["THE", "FULL", "PICTURE."],
    sub: "Projects From The Studio, Listed Below.",
    ghost: "WORK",
    cta: null,
  },
  featured: { label: "Featured" },
  more: { label: "Projects", lines: ["ALL", "PROJECTS."], intro: "Featured work first, then the rest of the studio's projects. Switch between cards and a list.", cta: null },
  controls: { view_label: "Project View", cards: "Cards", list: "List", previous: "Previous Project", next: "Next Project", go_to: "Show Project", load_more: "Load More", showing: "Showing {shown} of {total}" },
  empty_text: "No Projects To Show Yet.",
  projects: [],
};
