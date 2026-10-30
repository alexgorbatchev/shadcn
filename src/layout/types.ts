import type { Density } from "../density/types.js";

/** Density-aware spacing tokens from `theme.css`, smallest to largest. */
export type LayoutSpacing = "none" | "control" | "panel-sm" | "panel" | "field" | "section";

/** Viewport breakpoints; `base` applies below `sm`. */
export type LayoutBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

/** A single value, or values keyed by the viewport breakpoint where each one starts to apply. */
export type ResponsiveValue<Value> = Value | Readonly<Partial<Record<LayoutBreakpoint, Value>>>;

/**
 * Block size:
 * - `auto`: intrinsic height.
 * - `full`: the parent's full height; descendants may shrink below their intrinsic height.
 * - `viewport`: exactly the dynamic viewport height, for application frames.
 * - `min-viewport`: at least the dynamic viewport height, for pages that may scroll as a whole.
 */
export type LayoutHeight = "auto" | "full" | "viewport" | "min-viewport";

export type StackDirection = "vertical" | "horizontal";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
/** Minimum track width for intrinsically responsive grids that fit as many columns as the width allows. */
export type GridMinColumnWidth = "xs" | "sm" | "md" | "lg";
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | "full";
export type GridAlign = "start" | "center" | "end" | "stretch";

export type ContainerWidth = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export type LayoutState = { slot: string; density?: Density };
