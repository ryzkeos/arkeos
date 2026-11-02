"use client";
import { createContext, useContext } from "react";
import type { Project, Service, SiteSettings } from "./types";

export type ContentSeed = { settings?: SiteSettings; projects?: Project[]; services?: Service[] };

const Ctx = createContext<ContentSeed>({});

export const ContentSeedProvider = Ctx.Provider;
export const useContentSeed = () => useContext(Ctx);
