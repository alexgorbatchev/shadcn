import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { IDensityProps } from "../density/types.js";
import {
  GAP_CLASSES,
  GROW_CLASSES,
  HEIGHT_CLASSES,
  PADDING_CLASSES,
  STACK_ALIGN_CLASSES,
  STACK_DIRECTION_CLASSES,
  STACK_JUSTIFY_CLASSES,
} from "../layout/constants.js";
import { responsiveClassNames } from "../layout/responsiveClassNames.js";
import type {
  LayoutHeight,
  LayoutSpacing,
  LayoutState,
  ResponsiveValue,
  StackAlign,
  StackDirection,
  StackJustify,
} from "../layout/types.js";
import { cn } from "../utils/cn.js";

type StackProps = useRender.ComponentProps<"div", LayoutState> &
  IDensityProps & {
    /** Main axis; pass breakpoint values, such as `{ base: "vertical", md: "horizontal" }`, to change it responsively. */
    direction?: ResponsiveValue<StackDirection>;
    gap?: LayoutSpacing;
    padding?: LayoutSpacing;
    /** Cross-axis alignment of the children. */
    align?: StackAlign;
    /** Main-axis distribution of the children. */
    justify?: StackJustify;
    wrap?: boolean;
    /** Take the remaining space of a parent Stack; content may shrink below its intrinsic size. */
    grow?: boolean;
    height?: LayoutHeight;
  };

/** Flex layout along one axis with density-aware spacing. Use `render` for a semantic element. */
function Stack({
  direction = "vertical",
  gap = "none",
  padding = "none",
  align,
  justify,
  wrap = false,
  grow = false,
  height = "auto",
  density,
  className,
  render,
  ...props
}: StackProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex",
          responsiveClassNames(direction, STACK_DIRECTION_CLASSES),
          GAP_CLASSES[gap],
          PADDING_CLASSES[padding],
          align && STACK_ALIGN_CLASSES[align],
          justify && STACK_JUSTIFY_CLASSES[justify],
          wrap && "flex-wrap",
          grow && GROW_CLASSES,
          HEIGHT_CLASSES[height],
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "stack", density },
  });
}

export { Stack };
export type { StackProps };
