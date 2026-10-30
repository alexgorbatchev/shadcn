import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Density, IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "sm" | "base" | "lg" | "xl";

const HEADING_TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;
const DEFAULT_SIZES: Record<HeadingLevel, HeadingSize> = { 1: "xl", 2: "lg", 3: "base", 4: "sm", 5: "sm", 6: "sm" };
const SIZE_CLASSES: Record<HeadingSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

type HeadingState = { slot: "heading"; level: HeadingLevel; density?: Density };
type HeadingProps = useRender.ComponentProps<"h2", HeadingState> &
  IDensityProps & {
    /** Document outline level; it selects the `h1`–`h6` element. */
    level: HeadingLevel;
    /** Visual size, independent of the outline level. Defaults by level. */
    size?: HeadingSize;
    truncate?: boolean;
  };

/** Section heading whose outline level and visual size are chosen independently. */
function Heading({ level, size, truncate = false, density, className, render, ...props }: HeadingProps): ReactElement {
  return useRender({
    defaultTagName: HEADING_TAGS[level],
    props: mergeProps<"h2">(
      {
        className: cn(
          "min-w-0 font-semibold text-foreground",
          SIZE_CLASSES[size ?? DEFAULT_SIZES[level]],
          truncate ? "truncate" : "break-words",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "heading", level, density },
  });
}

export { Heading };
export type { HeadingProps, HeadingLevel, HeadingSize };
