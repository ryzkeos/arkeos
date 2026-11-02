import type { ServicesCopy } from "./types";

export const services: ServicesCopy = {
  hero: {
    eyebrow: "What We Offer",
    lines: ["OUR", "SERVICES."],
    sub: "What We Do And How We Work With Clients.",
    ghost: "SERVICES",
    cta: null,
  },
  capabilities: { label: "Our Capabilities", lines: ["WHAT", "WE DO."], intro: "Design, build and animation under one roof. Each service is planned around your goals, so every piece fits the whole and nothing is wasted.", cta: { label: "Start a Project", href: "/contact" } },
  process: { label: "How We Work", lines: ["THE", "PROCESS."], intro: "A clear process keeps projects calm and on time. You know what happens next at every step, and you can see progress without chasing us for updates.", cta: null },
  process_steps: [
    { title: "Discovery", desc: "We Learn Your Goals, Your Users And Your Limits Before We Write Any Code." },
    { title: "Strategy", desc: "We Agree On Scope, Structure And A Clear Plan With Fixed Milestones." },
    { title: "Execution", desc: "We Build In Small Steps And Show Progress Often, So There Are No Surprises." },
    { title: "Delivery", desc: "We Launch, Hand Over Everything And Stay Available For Support." },
  ],
  services: [],
  empty_text: "No Services Listed Yet.",
};
