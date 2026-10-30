"use client";
import "@/app/globals.css";
import Cursor from "./Cursor";
import PageTransition from "./PageTransition";
import SmoothScroll from "./SmoothScroll";
import Header from "./Header";
import Footer from "./Footer";
import { SiteSettingsProvider } from "./SiteSettings";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <Cursor />
      <PageTransition />
      <SmoothScroll />
      <Header />
      {children}
      <Footer />
    </SiteSettingsProvider>
  );
}
