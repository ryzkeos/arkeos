"use client";
import "@/app/globals.css";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import PageTransition from "./PageTransition";
import WarmPages from "./WarmPages";
import SmoothScroll from "./SmoothScroll";
import Header from "./Header";
import Footer from "./Footer";
import { SiteSettingsProvider } from "./SiteSettings";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <Preloader />
      <WarmPages />
      <Cursor />
      <PageTransition />
      <SmoothScroll />
      <Header />
      {children}
      <Footer />
    </SiteSettingsProvider>
  );
}
