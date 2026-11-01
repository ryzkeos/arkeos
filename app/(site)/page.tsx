import type { Metadata } from "next";
import HomeView from "@/components/HomeView";

const TITLE = "Arkeos | Home";
const DESCRIPTION = "Arkeos is a small studio that builds websites, apps and motion work. See our projects and services.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, images: ["/assets/img/og.webp"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <HomeView />;
}
