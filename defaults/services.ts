import type { ServicesCopy } from "./types";

export const services: ServicesCopy = {
  hero: {
    eyebrow: "What We Offer",
    lines: ["OUR", "SERVICES."],
    sub: "What we do and how we work with clients.",
    ghost: "SERVICES",
    cta: null,
  },
  capabilities: { label: "Our Capabilities", lines: ["WHAT", "WE DO."], intro: "Design, build and motion work under one roof. Each service is planned around your goals, so every piece fits the whole and nothing is wasted.", cta: { label: "Start a Project", href: "/contact" } },
  process: { label: "How We Work", lines: ["THE", "PROCESS."], intro: "A clear process keeps projects calm and on time. You know what happens next at every step, and you can see progress without chasing us for updates.", cta: null },
  process_steps: [
    { title: "Discovery", desc: "We learn your goals, your users and your limits before we write any code." },
    { title: "Strategy", desc: "We agree on scope, structure and a clear plan with fixed milestones." },
    { title: "Execution", desc: "We build in small steps and show progress often, so there are no surprises." },
    { title: "Delivery", desc: "We launch, hand over everything and stay available for support." },
  ],
  services: [],
  empty_text: "No services listed yet.",
};
