import type { Metadata } from "next";
import PrivacyView from "./PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What this website collects, why, and how to contact the owner about your data.",
  openGraph: {
    title: "Arkeos | Privacy Policy",
    description: "What this website collects, why, and how to contact the owner about your data.",
  },
};

const updated = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function Page() {
  return <PrivacyView updated={updated} />;
}
