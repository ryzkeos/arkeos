import { page_meta } from "@/lib/site";
import ServicesView from "@/components/ServicesView";

export const metadata = page_meta({
  path: "/services",
  title: "Web and System Development Services",
  share_title: "Arkeos | Web and System Development Services",
  description: "Arkeos offers web development and system development, from websites and web apps to custom software, plus motion design and branding.",
});

export default function ServicesPage() {
  return <ServicesView />;
}
