import type { ProjectsCopy } from "./types";

export const projects: ProjectsCopy = {
  hero: {
    eyebrow: "Selected Work",
    lines: ["THE", "FULL", "PICTURE."],
    sub: "Projects from the studio, listed below.",
    ghost: "WORK",
    cta: null,
  },
  featured: { label: "Featured", lines: ["FEATURED", "WORK."], intro: "The projects we are proudest of, shown one at a time.", cta: null },
  more: { label: "More Projects", lines: ["ALL", "PROJECTS."], intro: "The rest of the studio's work. Switch between cards and a list.", cta: null },
  controls: { view_label: "Project view", cards: "Cards", list: "List", previous: "Previous project", next: "Next project", go_to: "Show project" },
  empty_text: "No projects to show yet.",
  projects: [],
};
