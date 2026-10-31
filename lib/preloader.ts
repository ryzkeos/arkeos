import { useSyncExternalStore } from "react";

export const PRELOADER_KEY = "arkeos_intro_seen";

let done = false;
const subs = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => { subs.delete(fn); };
};

export const useIntroDone = () => useSyncExternalStore(subscribe, () => done, () => false);
