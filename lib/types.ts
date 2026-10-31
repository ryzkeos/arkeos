export type CinemaType = "video" | "image" | "html";

export type Pillar = {
  id: string;
  title: string;
  description: string;
  icon_url: string | null;
  cinema_url: string | null;
  cinema_type: CinemaType;
  sort_order?: number;
};

export type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  media: string | null;
  color: string | null;
  url?: string | null;
  visible: boolean;
  sort_order?: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price?: string | null;
  icon_url?: string | null;
  cinema_url?: string | null;
  cinema_type?: CinemaType | null;
  visible: boolean;
  sort_order?: number;
};

export type Inquiry = {
  id: string;
  name: string | null;
  email: string | null;
  project_type: string | null;
  budget: string | null;
  timeline: string | null;
  message?: string | null;
  status: "unread" | "read";
  created_at: string | null;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
};

export type StatItem = {
  n: number;
  label: string;
  desc: string;
};

export type ValueItem = {
  title: string;
  desc: string;
};

export type ProcessStep = {
  title: string;
  desc: string;
};

export type SiteSettings = Partial<{
  accent_color: string;
  availability: "available" | "booked";
  social_github: string;
  social_instagram: string;
  social_facebook: string;
  hero_video: string;
  tagline: string;
  cta_text: string;
  font_display: string;
  font_ui_regular: string;
  font_ui_medium: string;
  font_label: string;
  studio_name: string;
  founded_year: string;
  contact_email: string;
  response_time: string;
  about_story: string;
  about_stats: string;
  about_values: string;
  process_steps: string;
  team: string;
  hero_headline: string;
  hero_deco: string;
  about_image: string;
  about_image_wide: string;
  what_intro: string;
  work_intro: string;
  projects_count: string;
  years_active: string;
  clients_count: string;
  copy_shared: string;
  copy_home: string;
  copy_projects: string;
  copy_services: string;
  copy_about: string;
  copy_contact: string;
  copy_privacy: string;
  copy_not_found: string;
}>;

export type Session = { access_token: string; [k: string]: unknown };
