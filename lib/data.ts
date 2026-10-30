import type { Project } from "./types";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** fallback list. used when supabase is empty or unreachable. */
export const FALLBACK_PROJECTS: Project[] = [
  { title: "Lumina Finance", description: "A full rebrand and digital platform for a next-generation fintech challenger rewriting how wealth management feels and functions.", tags: ["Web", "Motion", "GSAP"], media: null, color: "#C8FF00", visible: true },
  { title: "Vertis Agency", description: "An Awwwards-recognised portfolio site for a boutique creative agency demanding to stand entirely apart from its category.", tags: ["Interactive", "Three.js", "Lenis"], media: null, color: "#C8FF00", visible: true },
  { title: "Nocturne App", description: "A sleep and wellness app UI concept with biometric-responsive animation. Form follows emotion. Design follows data.", tags: ["UI/UX", "Motion", "Branding"], media: null, color: "#C8FF00", visible: true },
  { title: "Solus Architecture", description: "A brutalist digital presence for a forward-thinking architecture firm. Every scroll reveals space. Every transition has weight.", tags: ["Web", "GSAP", "ScrollTrigger"], media: null, color: "#C8FF00", visible: true },
  { title: "Helix Biotech", description: "Science doesn't have to look sterile. A bold interactive platform for a gene-therapy startup making complex science feel viscerally human.", tags: ["Web", "Motion", "Interactive"], media: null, color: "#C8FF00", visible: true },
  { title: "Drift Collective", description: "An immersive brand world for a streetwear collective born at the intersection of skate culture and high design. Raw, kinetic, unapologetic.", tags: ["Branding", "Web", "Video"], media: null, color: "#C8FF00", visible: true },
];

export const TEAM = [
  {
    name: "Alex Reyes",
    role: "Founder & Creative Director",
    bio: "Designer-turned-developer. Spent five years at top agencies watching brilliant strategy get murdered by mediocre execution. Started Arkeos to make sure that never happens to a client again.",
    photo: null as string | null,
  },
];

export const SOCIAL_LABELS = ["GitHub", "Instagram", "Facebook"] as const;
