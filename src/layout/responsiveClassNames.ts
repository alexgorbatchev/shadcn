import { LAYOUT_BREAKPOINTS } from "./constants.js";
import type { LayoutBreakpoint, ResponsiveValue } from "./types.js";

function isBreakpointMap<Value extends string | number>(
  value: ResponsiveValue<Value>,
): value is Readonly<Partial<Record<LayoutBreakpoint, Value>>> {
  return typeof value === "object";
}

/** Resolves a responsive value to the literal class names of each breakpoint it sets. */
export function responsiveClassNames<Value extends string | number>(
  value: ResponsiveValue<Value> | undefined,
  classes: Readonly<Record<LayoutBreakpoint, Readonly<Record<Value, string>>>>,
): string {
  if (value === undefined) return "";
  if (!isBreakpointMap(value)) return classes.base[value];
  return LAYOUT_BREAKPOINTS.flatMap((breakpoint) => {
    const breakpointValue = value[breakpoint];
    return breakpointValue === undefined ? [] : [classes[breakpoint][breakpointValue]];
  }).join(" ");
}
