import type { Metadata } from "next";
import ServicesView from "@/components/ServicesView";

export const metadata: Metadata = {
  title: "Services",
  description: "Services offered by Arkeos and how we work.",
  openGraph: {
    title: "Arkeos | Services",
    description: "Services offered by Arkeos and how we work.",
  },
};

export default function ServicesPage() {
  return <ServicesView />;
}
