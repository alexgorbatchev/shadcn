import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { IDensityProps } from "../density/types.js";
import {
  GAP_CLASSES,
  GRID_ALIGN_CLASSES,
  GRID_COLUMN_CLASSES,
  GRID_MIN_COLUMN_WIDTH_CLASSES,
  GRID_SPAN_CLASSES,
  GROW_CLASSES,
  HEIGHT_CLASSES,
  PADDING_CLASSES,
} from "../layout/constants.js";
import { responsiveClassNames } from "../layout/responsiveClassNames.js";
import type {
  GridAlign,
  GridColumns,
  GridMinColumnWidth,
  GridSpan,
  LayoutHeight,
  LayoutSpacing,
  LayoutState,
  ResponsiveValue,
} from "../layout/types.js";
import { cn } from "../utils/cn.js";

type GridProps = useRender.ComponentProps<"div", LayoutState> &
  IDensityProps & {
    /** Column count, optionally per viewport breakpoint, such as `{ base: 1, md: 2, xl: 4 }`. */
    columns?: ResponsiveValue<GridColumns>;
    /** Fit as many equal columns of at least this width as the grid's own width allows; replaces `columns`. */
    minColumnWidth?: GridMinColumnWidth;
    gap?: LayoutSpacing;
    padding?: LayoutSpacing;
    /** Block-axis alignment of items within their rows. */
    align?: GridAlign;
    /** Take the remaining space of a parent Stack; content may shrink below its intrinsic size. */
    grow?: boolean;
    height?: LayoutHeight;
  };

/** CSS grid with breakpoint or intrinsic columns and density-aware spacing. Use `render` for a semantic element. */
function Grid({
  columns = 1,
  minColumnWidth,
  gap = "panel",
  padding = "none",
  align,
  grow = false,
  height = "auto",
  density,
  className,
  render,
  ...props
}: GridProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "grid min-w-0",
          minColumnWidth === undefined
            ? responsiveClassNames(columns, GRID_COLUMN_CLASSES)
            : GRID_MIN_COLUMN_WIDTH_CLASSES[minColumnWidth],
          GAP_CLASSES[gap],
          PADDING_CLASSES[padding],
          align && GRID_ALIGN_CLASSES[align],
          grow && GROW_CLASSES,
          HEIGHT_CLASSES[height],
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "grid", density },
  });
}

type GridItemProps = useRender.ComponentProps<"div", LayoutState> &
  IDensityProps & {
    /** Columns to span, optionally per viewport breakpoint; `full` spans every column at any count. */
    span?: ResponsiveValue<GridSpan>;
  };

/** A grid cell that spans several columns. Use `render` for a semantic element. */
function GridItem({ span, density, className, render, ...props }: GridItemProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      { className: cn("min-w-0", responsiveClassNames(span, GRID_SPAN_CLASSES), className) },
      props,
    ),
    render,
    state: { slot: "grid-item", density },
  });
}

export { Grid, GridItem };
export type { GridProps, GridItemProps };
