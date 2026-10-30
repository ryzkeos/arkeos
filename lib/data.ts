import type { Project, TeamMember } from "./types";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FALLBACK_PROJECTS: Project[] = [];

export const TEAM: TeamMember[] = [];

export const SOCIAL_LABELS = ["GitHub", "Instagram", "Facebook"] as const;
