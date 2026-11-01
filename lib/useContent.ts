"use client";
import { projects_store, services_store } from "./content_store";
import type { Project, Service } from "./types";
import { use_store } from "./use_store";

export function useProjects(): Project[] | null {
  return use_store(projects_store).data;
}

export function useServices(): Service[] | null {
  return use_store(services_store).data;
}
