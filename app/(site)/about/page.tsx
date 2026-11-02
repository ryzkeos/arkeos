import { page_meta } from "@/lib/site";
import "@/styles/about.css";
import AboutView from "@/components/AboutView";

export const metadata = page_meta({ path: "/about", description:
  "The story, values and people behind Arkeos, a small studio delivering quality web and system work that is lightweight, visual and flexible on any device." });

export default function AboutPage() {
  return <AboutView />;
}
