"use client";

import { useDocumentGuard, type IDocumentGuardProps } from "../hooks/useDocumentGuard.js";
import { observeLayoutGuards } from "../utils/observeLayoutGuards.js";

export type ILayoutGuardProps = IDocumentGuardProps;

/** Development-only containment checks for data-layout-boundary surfaces. */
export function LayoutGuard({ ownerDocument }: ILayoutGuardProps): null {
  useDocumentGuard(observeLayoutGuards, ownerDocument);
  return null;
}
