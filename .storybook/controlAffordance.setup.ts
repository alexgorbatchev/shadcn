import { afterEach, expect } from "vitest";
import { findBorderlessTextButtons } from "./controlBoundary";
import { findMismatchedSiblingHeights } from "./controlHeights";

// Every story, in every suite that renders the catalog, fails when a text button reads as a label: borderless and
// unfilled is reserved for icon buttons and for actions styled as links.
afterEach(() => {
  expect(findBorderlessTextButtons(document.body), "text buttons without a visible affordance").toEqual([]);
});

// Sibling controls on one row share one height, whether text, outline, filled or icon buttons (visual QA "sizing").
afterEach(() => {
  expect(findMismatchedSiblingHeights(document.body), "sibling controls of different heights").toEqual([]);
});
