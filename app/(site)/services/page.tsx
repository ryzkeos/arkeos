import type { Metadata } from "next";
import ServicesView from "@/components/ServicesView";

export const metadata: Metadata = {
  title: { absolute: "Services | ARKEOS" },
  description: "Services offered by ARKEOS and how we work.",
  openGraph: {
    title: "Services | ARKEOS",
    description: "Services offered by ARKEOS and how we work.",
  },
};

export default function ServicesPage() {
  return <ServicesView />;
}
