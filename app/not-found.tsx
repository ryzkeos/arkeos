import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: { absolute: "404 — ARKEOS" },
  description: "Page not found. Lost in the dark.",
};

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
