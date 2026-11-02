import { page_meta } from "@/lib/site";
import "@/styles/about.css";
import AboutView from "@/components/AboutView";

export const metadata = page_meta({
  path: "/about",
  title: "About",
  share_title: "Arkeos | About",
  description: "The story, values and people behind Arkeos, a small studio for web and system development.",
});

export default function AboutPage() {
  return <AboutView />;
}
