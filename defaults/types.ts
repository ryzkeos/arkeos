import type { ProcessStep, Project, Service, StatItem, TeamMember, ValueItem } from "@/lib/types";

export type LinkCopy = { label: string; href: string };
export type HeroCopy = { eyebrow: string; lines: string[]; sub: string; ghost: string; cta: LinkCopy | null };
export type SectionCopy = { label: string; lines: string[]; intro: string; cta: LinkCopy | null };
export type PageKey = "shared" | "home" | "projects" | "services" | "about" | "contact" | "privacy" | "not_found";

export type SharedCopy = {
  brand: { name: string; tagline: string; email: string; response_time: string; founded_year: number };
  nav: LinkCopy[];
  availability: { available_text: string; booked_text: string };
  menu: { open_label: string; close_label: string };
  footer: { rights_text: string; privacy_label: string };
  cta: {
    label: string;
    headline: string;
    button: string;
    deco_a_url: string;
    deco_b_url: string;
    deco_c_url: string;
    deco_d_url: string;
  };
  buttons: {
    view_all_projects: string;
    view_all_services: string;
    view_project: string;
    view_project_short: string;
    back_home: string;
  };
  preloader: { statuses: string[] };
  hero: { deco: string; hover_word: string; scroll_label: string };
  section_media: { url: string };
};

export type HomeCopy = {
  hero: HeroCopy;
  what: SectionCopy;
  what_count: number;
  work: SectionCopy;
  work_count: number;
  why: SectionCopy;
};

export type ProjectsCopy = {
  hero: HeroCopy;
  featured: { label: string };
  more: SectionCopy;
  controls: { view_label: string; cards: string; list: string; previous: string; next: string; go_to: string; load_more: string; showing: string };
  empty_text: string;
  projects: Project[];
};

export type ServicesCopy = {
  hero: HeroCopy;
  capabilities: SectionCopy;
  process: SectionCopy;
  process_steps: ProcessStep[];
  services: Service[];
  empty_text: string;
};

export type AboutCopy = {
  hero: HeroCopy;
  story: SectionCopy;
  story_paragraphs: string[];
  stats: SectionCopy;
  stats_items: StatItem[];
  values: SectionCopy;
  values_items: ValueItem[];
  team: SectionCopy;
  team_members: TeamMember[];
  empty_text: string;
  about_image: string;
  about_image_wide: string;
};

export type ContactCopy = {
  hero: HeroCopy;
  info: { title: string; body: string; email_label: string; response_label: string };
  form: {
    name_label: string;
    name_placeholder: string;
    email_label: string;
    email_placeholder: string;
    type_label: string;
    type_placeholder: string;
    project_types: string[];
    budget_label: string;
    budget_placeholder: string;
    budget_ranges: string[];
    timeline_label: string;
    timeline_placeholder: string;
    timelines: string[];
    message_label: string;
    message_placeholder: string;
    submit_label: string;
    sending_label: string;
    select_close_label: string;
    note: string;
  };
  success: { title: string; body: string; back_label: string };
  errors: { required: string; invalid_email: string; network: string; server: string };
};

export type PrivacyCopy = {
  label: string;
  title: string;
  updated_label: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export type NotFoundCopy = {
  label: string;
  num: string;
  tagline: string;
  button_label: string;
  aria_section: string;
  aria_num: string;
  aria_tagline: string;
  aria_button: string;
};

export type Defaults = {
  shared: SharedCopy;
  home: HomeCopy;
  projects: ProjectsCopy;
  services: ServicesCopy;
  about: AboutCopy;
  contact: ContactCopy;
  privacy: PrivacyCopy;
  not_found: NotFoundCopy;
};
