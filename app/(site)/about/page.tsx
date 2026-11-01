import type { Metadata } from "next";
import "@/styles/about.css";
import AboutView from "@/components/AboutView";

export const metadata: Metadata = {
  title: "About",
  description: "The story, values and people behind the studio.",
  openGraph: {
    title: "Arkeos | About",
    description: "The story, values and people behind the studio.",
  },
};

export default function AboutPage() {
  return <AboutView />;
}
