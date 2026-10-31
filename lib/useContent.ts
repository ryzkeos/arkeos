"use client";
import { useEffect, useState } from "react";
import { loadProjects, loadServices } from "./content";
import type { Project, Service } from "./types";

function useLoaded<T>(load: () => Promise<T[]>): T[] | null {
  const [data, setData] = useState<T[] | null>(null);

  useEffect(() => {
    let active = true;
    load()
      .then((rows) => {
        if (active) setData(rows);
      })
      .catch(() => {
        if (active) setData([]);
      });
    return () => {
      active = false;
    };
  }, [load]);

  return data;
}

export function useProjects(): Project[] | null {
  return useLoaded(loadProjects);
}

export function useServices(): Service[] | null {
  return useLoaded(loadServices);
}
