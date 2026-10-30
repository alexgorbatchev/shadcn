import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { IDensityProps } from "../density/types.js";
import { CONTAINER_WIDTH_CLASSES, PADDING_CLASSES } from "../layout/constants.js";
import type { ContainerWidth, LayoutSpacing, LayoutState } from "../layout/types.js";
import { cn } from "../utils/cn.js";

type ContainerProps = useRender.ComponentProps<"div", LayoutState> &
  IDensityProps & {
    /** Maximum inline size: `xs` 20rem, `sm` 24rem, `md` 42rem, `lg` 64rem, `xl` 80rem, or `full`. */
    width?: ContainerWidth;
    padding?: LayoutSpacing;
  };

/** Horizontally centered column with a maximum width. Use `render` for a semantic element such as `main`. */
function Container({
  width = "lg",
  padding = "none",
  density,
  className,
  render,
  ...props
}: ContainerProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("mx-auto w-full min-w-0", CONTAINER_WIDTH_CLASSES[width], PADDING_CLASSES[padding], className),
      },
      props,
    ),
    render,
    state: { slot: "container", density },
  });
}

export { Container };
export type { ContainerProps };
