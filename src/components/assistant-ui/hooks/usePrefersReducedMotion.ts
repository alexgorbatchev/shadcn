import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: VoidFunction): VoidFunction {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readPreference(): boolean {
  return window.matchMedia(QUERY).matches;
}

function readServerPreference(): boolean {
  return true;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readPreference, readServerPreference);
}
