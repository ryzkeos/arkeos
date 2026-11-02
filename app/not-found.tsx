import type { Metadata } from "next";
import { SITE_TITLE } from "@/lib/site";
import SiteShell from "@/components/SiteShell";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: "Page not found. Lost in the dark.",
};

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
