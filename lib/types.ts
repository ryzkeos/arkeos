export type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  media: string | null;
  color: string | null;
  visible: boolean;
  sort_order?: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
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
}>;

export type Session = { access_token: string; [k: string]: unknown };
