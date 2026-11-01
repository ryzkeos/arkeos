import type { HomeCopy } from "./types";

export const home: HomeCopy = {
  hero: {
    eyebrow: "est. {founded_year}",
    lines: ["WE BUILD", "DIGITAL", "LEGACIES."],
    sub: "",
    ghost: "",
    cta: { label: "View Work", href: "/projects" },
  },
  what: {
    label: "What We Do",
    lines: ["CRAFT", "THAT CUTS."],
    intro:
      "We are not a production house. We are your unfair advantage. Every project we touch becomes a benchmark in its category, not by accident, by obsession.",
    cta: { label: "View All Services", href: "/services" },
  },
  what_count: 4,
  work: {
    label: "Selected Work",
    lines: ["THE", "WORK."],
    intro: "A close look at recent projects from the studio. Each one shows how we plan, design and build work that stays sharp long after launch.",
    cta: { label: "View All Projects", href: "/projects" },
  },
  work_count: 5,
  why: { label: "Why {name}", lines: ["BUILT", "DIFFERENT."], intro: "Our studio is small by choice. You work with the people who build your project, and every detail gets the same care from the first call to launch.", cta: null },
};
