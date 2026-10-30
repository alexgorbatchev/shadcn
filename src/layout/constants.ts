import type {
  ContainerWidth,
  GridAlign,
  GridColumns,
  GridMinColumnWidth,
  GridSpan,
  LayoutBreakpoint,
  LayoutHeight,
  LayoutSpacing,
  StackAlign,
  StackDirection,
  StackJustify,
} from "./types.js";

// Every class string is written out in full so consumers' Tailwind scan of `dist` generates it.

export const GAP_CLASSES: Record<LayoutSpacing, string> = {
  none: "gap-0",
  control: "gap-control-gap",
  "panel-sm": "gap-panel-sm",
  panel: "gap-panel",
  field: "gap-field-gap",
  section: "gap-section",
};

export const PADDING_CLASSES: Record<LayoutSpacing, string> = {
  none: "p-0",
  control: "p-control-gap",
  "panel-sm": "p-panel-sm",
  panel: "p-panel",
  field: "p-field-gap",
  section: "p-section",
};

export const HEIGHT_CLASSES: Record<LayoutHeight, string> = {
  auto: "",
  full: "h-full min-h-0",
  viewport: "h-dvh min-h-0",
  "min-viewport": "min-h-dvh",
};

export const GROW_CLASSES = "min-h-0 min-w-0 flex-1";

export const STACK_DIRECTION_CLASSES: Record<LayoutBreakpoint, Record<StackDirection, string>> = {
  base: { vertical: "flex-col", horizontal: "flex-row" },
  sm: { vertical: "sm:flex-col", horizontal: "sm:flex-row" },
  md: { vertical: "md:flex-col", horizontal: "md:flex-row" },
  lg: { vertical: "lg:flex-col", horizontal: "lg:flex-row" },
  xl: { vertical: "xl:flex-col", horizontal: "xl:flex-row" },
};

export const STACK_ALIGN_CLASSES: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export const STACK_JUSTIFY_CLASSES: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const GRID_COLUMN_CLASSES: Record<LayoutBreakpoint, Record<GridColumns, string>> = {
  base: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    12: "grid-cols-12",
  },
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
    12: "sm:grid-cols-12",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    12: "md:grid-cols-12",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
    12: "lg:grid-cols-12",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
    12: "xl:grid-cols-12",
  },
};

export const GRID_MIN_COLUMN_WIDTH_CLASSES: Record<GridMinColumnWidth, string> = {
  xs: "grid-cols-[repeat(auto-fill,minmax(min(100%,8rem),1fr))]",
  sm: "grid-cols-[repeat(auto-fill,minmax(min(100%,12rem),1fr))]",
  md: "grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))]",
  lg: "grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))]",
};

export const GRID_ALIGN_CLASSES: Record<GridAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export const GRID_SPAN_CLASSES: Record<LayoutBreakpoint, Record<GridSpan, string>> = {
  base: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    full: "col-span-full",
  },
  sm: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
    full: "sm:col-span-full",
  },
  md: {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    full: "md:col-span-full",
  },
  lg: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    full: "lg:col-span-full",
  },
  xl: {
    1: "xl:col-span-1",
    2: "xl:col-span-2",
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    full: "xl:col-span-full",
  },
};

export const CONTAINER_WIDTH_CLASSES: Record<ContainerWidth, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export const LAYOUT_BREAKPOINTS: readonly LayoutBreakpoint[] = ["base", "sm", "md", "lg", "xl"];
