"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import type { Store, StoreState } from "./content_store";

export const use_isomorphic_layout_effect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const EMPTY: StoreState<never> = { data: null, ready: false };

export function use_store<T>(store: Store<T>): StoreState<T> {
  const [state, set_state] = useState<StoreState<T>>(EMPTY);

  use_isomorphic_layout_effect(() => {
    set_state(store.get());
    const off = store.subscribe(() => set_state(store.get()));
    void store.refresh();
    return off;
  }, [store]);

  return state;
}
