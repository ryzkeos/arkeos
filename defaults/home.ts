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
    intro: "A selection of recent projects from the studio.",
    cta: { label: "View All Projects", href: "/projects" },
  },
  work_count: 5,
  why: { label: "Why {name}", lines: ["BUILT", "DIFFERENT."], intro: "", cta: null },
  why_stats: [
    { n: 0, label: "PROJECTS SHIPPED", desc: "Every single one delivered on time, on spec, and above expectation." },
    { n: 0, label: "YEARS ACTIVE", desc: "Refusing to ship anything that would not carry the name. That standard does not drop." },
    { n: 0, label: "CLIENTS SERVED", desc: "From solo founders to funded startups. Every client gets the same obsessive attention." },
  ],
};
