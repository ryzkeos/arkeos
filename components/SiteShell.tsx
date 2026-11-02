"use client";
import "@/app/globals.css";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import PageTransition from "./PageTransition";
import WarmPages from "./WarmPages";
import SmoothScroll from "./SmoothScroll";
import Header from "./Header";
import Footer from "./Footer";
import { ContentSeedProvider, type ContentSeed } from "@/lib/content_seed";
import { SiteSettingsProvider } from "./SiteSettings";

const NO_SEED: ContentSeed = {};

export default function SiteShell({ children, seed }: { children: React.ReactNode; seed?: ContentSeed }) {
  return (
    <ContentSeedProvider value={seed ?? NO_SEED}>
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
    </ContentSeedProvider>
  );
}
