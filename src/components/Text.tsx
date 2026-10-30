import type { ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Density, IDensityProps } from "../density/types.js";
import type { TextAlign } from "../typography/types.js";
import { cn } from "../utils/cn.js";

type TextSize = "xs" | "sm" | "base" | "lg";
type TextTone = "default" | "muted" | "faint" | "primary" | "success" | "warning" | "destructive";
type TextWeight = "normal" | "medium" | "semibold";

const SIZE_CLASSES: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};
const TONE_CLASSES: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  faint: "text-faint-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};
const WEIGHT_CLASSES: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};
const ALIGN_CLASSES: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

type TextState = { slot: "text"; density?: Density };
type TextProps = useRender.ComponentProps<"p", TextState> &
  IDensityProps & {
    size?: TextSize;
    tone?: TextTone;
    weight?: TextWeight;
    align?: TextAlign;
    /** Keep one line and end overflowing text with an ellipsis; otherwise long words wrap. */
    truncate?: boolean;
    /** Use equal-width digits for aligned numbers. */
    tabular?: boolean;
  };

/** Body text with semantic size, tone, and weight. Renders a paragraph; use `render={<span />}` for inline text. */
function Text({
  size = "base",
  tone = "default",
  weight = "normal",
  align = "start",
  truncate = false,
  tabular = false,
  density,
  className,
  render,
  ...props
}: TextProps): ReactElement {
  return useRender({
    defaultTagName: "p",
    props: mergeProps<"p">(
      {
        className: cn(
          "min-w-0",
          SIZE_CLASSES[size],
          TONE_CLASSES[tone],
          WEIGHT_CLASSES[weight],
          ALIGN_CLASSES[align],
          truncate ? "truncate" : "break-words",
          tabular && "tabular-nums",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "text", density },
  });
}

export { Text };
export type { TextProps, TextSize, TextTone, TextWeight };
