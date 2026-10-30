import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: { absolute: "Work — ARKEOS Creative Studio" },
  description:
    "The complete Arkeos portfolio. Every project a benchmark. Web, motion, interactive, branding — built without compromise.",
  openGraph: {
    title: "Work — ARKEOS Creative Studio",
    description: "Every project a benchmark. Browse our complete portfolio.",
  },
};

export default function Page() {
  return <ProjectsView />;
}
