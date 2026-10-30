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
}>;

export type Session = { access_token: string; [k: string]: unknown };
