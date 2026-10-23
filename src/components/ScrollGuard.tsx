"use client";

import { useDocumentGuard, type IDocumentGuardProps } from "../hooks/useDocumentGuard.js";
import { observeScrollGuards } from "../utils/observeScrollGuards.js";

export type IScrollGuardProps = IDocumentGuardProps;

/** Development-only errors for user-scrollable overflow on elements marked data-scroll="none". */
export function ScrollGuard({ ownerDocument }: IScrollGuardProps): null {
  useDocumentGuard(observeScrollGuards, ownerDocument);
  return null;
}
