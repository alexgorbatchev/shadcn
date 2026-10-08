import { useRef, type RefObject } from "react";

export function useComboboxAnchor(): RefObject<HTMLDivElement | null> {
  return useRef<HTMLDivElement | null>(null);
}
