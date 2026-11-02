import { page_meta } from "@/lib/site";
import ServicesView from "@/components/ServicesView";

export const metadata = page_meta({
  path: "/services",
  title: "Services",
  share_title: "Arkeos | Services",
  description: "Arkeos offers web development, system development, software development and every kind of development in soft tech.",
});

export default function ServicesPage() {
  return <ServicesView />;
}
