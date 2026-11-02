import type { ProjectsCopy } from "./types";

export const projects: ProjectsCopy = {
  hero: {
    eyebrow: "Selected Work",
    lines: ["THE", "FULL", "PICTURE."],
    sub: "Projects from the studio, listed below.",
    ghost: "WORK",
    cta: null,
  },
  featured: { label: "Featured" },
  more: { label: "Projects", lines: ["ALL", "PROJECTS."], intro: "Featured work first, then the rest of the studio's projects. Switch between cards and a list.", cta: null },
  controls: { view_label: "Project view", cards: "Cards", list: "List", previous: "Previous project", next: "Next project", go_to: "Show project", load_more: "Load more", showing: "Showing {shown} of {total}" },
  empty_text: "No projects to show yet.",
  projects: [],
};
