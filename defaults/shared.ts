import type { SharedCopy } from "./types";

export const shared: SharedCopy = {
  brand: {
    name: "ARKEOS",
    tagline: "Crafting web experiences and motion work that demand attention and refuse to be forgotten.",
    email: "hello@arkeos.studio",
    response_time: "Within 48 hours",
    founded_year: 2026,
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  availability: { available_text: "Now Taking Projects", booked_text: "Currently Booked" },
  menu: { open_label: "Menu", close_label: "Close" },
  footer: { rights_text: "© {year} {name}. All rights reserved.", privacy_label: "Privacy Policy" },
  cta: { label: "Ready to Begin", headline: "LET'S BUILD SOMETHING EPIC TOGETHER.", button: "Contact Us" },
  buttons: {
    view_all_projects: "View All Projects",
    view_all_services: "View All Services",
    view_project: "View Project",
    view_project_short: "View",
    back_home: "Back to Home",
  },
  preloader: { statuses: ["Loading Assets", "Building Experience", "Almost Ready", "Welcome"] },
  hero: { deco: "ARKEOS", hover_word: "LEGACY", scroll_label: "Scroll down" },
};
