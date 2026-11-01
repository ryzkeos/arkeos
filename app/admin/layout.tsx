import type { Metadata } from "next";
import "./admin.css";
import { SiteSettingsProvider } from "@/components/SiteSettings";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SiteSettingsProvider track={false}>{children}</SiteSettingsProvider>;
}
