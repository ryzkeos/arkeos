"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import type { Store, StoreState } from "./content_store";
import { useContentSeed } from "./content_seed";

export const use_isomorphic_layout_effect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const EMPTY: StoreState<never> = { data: null, ready: false };

export function use_store<T>(store: Store<T>): StoreState<T> {
  const initial = (useContentSeed() as Record<string, unknown>)[store.key] as T | undefined;
  const [state, set_state] = useState<StoreState<T>>(initial !== undefined ? { data: initial, ready: true } : EMPTY);

  use_isomorphic_layout_effect(() => {
    if (initial !== undefined) store.seed(initial);
    set_state(store.get());
    const off = store.subscribe(() => set_state(store.get()));
    void store.refresh();
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return state;
}
