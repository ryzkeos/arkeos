"use client";
import { useArkeosAnimations } from "@/hooks/useArkeosAnimations";

export default function PageEffects({ pageHero = true, ready = true }: { pageHero?: boolean; ready?: boolean }) {
  useArkeosAnimations({ pageHero, ready });
  return null;
}
