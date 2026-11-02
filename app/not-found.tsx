import type { Metadata } from "next";
import { page_title } from "@/lib/site";
import SiteShell from "@/components/SiteShell";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: { absolute: page_title("Page Not Found") },
  description: "Page not found. Lost in the dark.",
};

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
