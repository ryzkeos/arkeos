import type { AboutCopy } from "./types";

export const about: AboutCopy = {
  hero: {
    eyebrow: "The Studio",
    lines: ["ABOUT", "THE", "STUDIO."],
    sub: "The Story, Values And People Behind {name}.",
    ghost: "STUDIO",
    cta: null,
  },
  story: { label: "Our Story", lines: ["WHERE", "WE COME FROM."], intro: "Arkeos began with a simple idea: build digital work that lasts. We keep teams small, plans simple and standards high on every project we take on.", cta: null },
  story_paragraphs: [
    "{name} is an independent studio that builds software with privacy as the starting point. We design, build and launch websites, apps and systems for people who want something clear, fast and honest.",
    "We began in {founded_year} with a simple rule: build only what a client needs, and keep their data in their hands. Too many products collect more than they use. We chose to do the opposite, and that choice shaped everything that came after.",
    "Early projects were small. A few pages, a simple tool, a brand that needed a clean start. Each one taught us the same lesson: when the plan is clear and the scope is honest, the work gets better and the stress goes down for everyone.",
    "Today we still keep the team small on purpose. You talk to the people who build your project, not to a layer of managers. Questions get direct answers, and bad news is shared early, while there is still time to act on it.",
    "Our process is calm and open. We start by listening, agree on a plan with fixed milestones, and show progress in small steps. You never have to guess what is happening or chase us for an update.",
    "We care about what happens after launch too. We hand over clean code, clear notes and every file we made, so your project does not depend on us. If you want us to stay, we are glad to. If you do not, you are never locked in.",
    "That is the story so far. We want to keep building work that lasts, with clients who value the same things, and we are always happy to hear about the next idea.",
  ],
  stats: { label: "By the Numbers", lines: ["THE", "RECORD."], intro: "Numbers do not tell the whole story, but they show how we work. We track what we ship and how long clients stay, and we share it plainly.", cta: null },
  stats_items: [
    { n: 0, label: "PROJECTS SHIPPED", desc: "Each One Delivered On Time And As Agreed." },
    { n: 0, label: "YEARS ACTIVE", desc: "Steady Work With The Same Standard From The Start." },
    { n: 0, label: "CLIENTS SERVED", desc: "Every Client Gets The Same Close Attention." },
  ],
  values: { label: "What We Stand For", lines: ["CORE", "VALUES."], intro: "These are the rules we follow on every project. They guide how we plan, how we talk to clients and what we choose to put our name on.", cta: null },
  values_items: [
    { title: "Privacy First", desc: "We Collect Only What Is Needed And We Keep It Safe." },
    { title: "Plain Work", desc: "Simple Designs And Clear Code That Anyone Can Maintain." },
    { title: "Built to Last", desc: "We Choose Tools And Methods That Stay Useful For Years." },
    { title: "Honest Scope", desc: "We Say What We Can Do, What It Costs And How Long It Takes." },
  ],
  team: { label: "The People", lines: ["WHO", "WE ARE."], intro: "A small team of designers and developers who care about the details. You will know who works on your project and how to reach them at any time.", cta: { label: "Start a Project", href: "/contact" } },
  team_members: [],
  empty_text: "Nothing To Show Yet.",
  about_image: "",
  about_image_wide: "",
};
