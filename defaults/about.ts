import type { AboutCopy } from "./types";

export const about: AboutCopy = {
  hero: {
    eyebrow: "The Studio",
    lines: ["ABOUT", "THE STUDIO."],
    sub: "The story, values and people behind {name}.",
    ghost: "STUDIO",
    cta: null,
  },
  story: { label: "Our Story", lines: ["WHERE", "WE COME FROM."], intro: "", cta: null },
  story_paragraphs: [
    "{name} is an independent studio that builds software with privacy as the starting point.",
    "We began in {founded_year} with a simple rule: build only what a client needs, and keep their data in their hands.",
  ],
  stats: { label: "By the Numbers", lines: ["THE", "RECORD."], intro: "", cta: null },
  stats_items: [
    { n: 5, label: "PROJECTS SHIPPED", desc: "Each one delivered on time and as agreed." },
    { n: 1, label: "YEARS ACTIVE", desc: "Steady work with the same standard from the start." },
    { n: 3, label: "CLIENTS SERVED", desc: "Every client gets the same close attention." },
  ],
  values: { label: "What We Stand For", lines: ["CORE", "VALUES."], intro: "", cta: null },
  values_items: [
    { title: "Privacy first", desc: "We collect only what is needed and we keep it safe." },
    { title: "Plain work", desc: "Simple designs and clear code that anyone can maintain." },
    { title: "Built to last", desc: "We choose tools and methods that stay useful for years." },
    { title: "Honest scope", desc: "We say what we can do, what it costs and how long it takes." },
  ],
  team: { label: "The People", lines: ["WHO", "WE ARE."], intro: "", cta: null },
  team_members: [],
  empty_text: "Nothing to show yet.",
  about_image: "",
  about_image_wide: "",
};
