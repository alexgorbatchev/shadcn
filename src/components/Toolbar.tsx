import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import { useAnalyticsInput } from "../hooks/useAnalyticsInput.js";
import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { cn } from "../utils/cn.js";
import { buttonVariants } from "./Button.js";

type ToolbarProps = ToolbarPrimitive.Root.Props &
  IDensityProps & {
    /** `framed` (the default) draws a card around the controls; `plain` lays them out inside another surface. */
    variant?: "framed" | "plain";
  };

function Toolbar({ density, className, variant = "framed", ...props }: ToolbarProps): ReactElement {
  return (
    <ToolbarPrimitive.Root
      data-density={density}
      data-slot="toolbar"
      data-scroll="none"
      data-variant={variant}
      className={(state) =>
        cn(
          "flex min-w-0 gap-control-gap rounded-sm text-card-foreground data-[orientation=vertical]:flex-col",
          variant === "framed" && "border border-border bg-card p-1",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/**
 * `outline` (the default) gives a text action a visible boundary at rest. `ghost` is borderless and is only for
 * icon-only buttons whose icon identifies them as controls, such as a formatting toolbar.
 */
type ToolbarItemVariant = "outline" | "ghost";

interface IToolbarItemVariantProps {
  /** `outline` (the default) for text actions; `ghost` only for icon-only buttons. */
  variant?: ToolbarItemVariant;
}

// A pressed toggle carries a 3:1 boundary and a tint, so its state does not rest on a faint fill alone.
const pressedClasses = "aria-pressed:border-primary aria-pressed:bg-primary/15 aria-pressed:text-foreground";

// In a vertical toolbar each tool spans the group, so its label starts at the shared leading edge instead of centring.
const verticalClasses = "data-[orientation=vertical]:justify-start";

function ToolbarButton({
  analytics,
  density,
  className,
  variant = "outline",
  ...props
}: ToolbarPrimitive.Button.Props & IDensityProps & IAnalyticsProps & IToolbarItemVariantProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("ToolbarButton", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <ToolbarPrimitive.Button
      data-density={density}
      data-slot="toolbar-button"
      data-variant={variant}
      className={(state) =>
        cn(
          buttonVariants({ variant }),
          pressedClasses,
          verticalClasses,
          "data-disabled:border-dashed data-disabled:border-border data-disabled:bg-transparent data-disabled:text-faint-foreground data-disabled:font-normal",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onClick={trackedOnClick}
    />
  );
}

function ToolbarLink({
  analytics,
  density,
  className,
  variant = "outline",
  ...props
}: ToolbarPrimitive.Link.Props & IDensityProps & IAnalyticsProps & IToolbarItemVariantProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("ToolbarLink", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <ToolbarPrimitive.Link
      data-density={density}
      data-slot="toolbar-link"
      data-variant={variant}
      className={(state) =>
        cn(buttonVariants({ variant }), verticalClasses, typeof className === "function" ? className(state) : className)
      }
      {...props}
      onClick={trackedOnClick}
    />
  );
}

function ToolbarInput({
  analytics,
  density,
  className,
  ...props
}: ToolbarPrimitive.Input.Props & IDensityProps & IAnalyticsProps): ReactElement {
  const analyticsInput = useAnalyticsInput("ToolbarInput", analytics, props);

  return (
    <ToolbarPrimitive.Input
      data-density={density}
      data-slot="toolbar-input"
      className={(state) =>
        cn(
          "h-control min-w-0 rounded-sm border border-input bg-secondary px-control-x text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      {...analyticsInput}
    />
  );
}

type ToolbarGroupProps = ToolbarPrimitive.Group.Props &
  IDensityProps & {
    /**
     * Lets the group's controls wrap onto further lines instead of overflowing, as a set of chips does. They run in
     * rows even inside a vertical toolbar, whose arrow keys still move through them in order.
     */
    wrap?: boolean;
  };

function ToolbarGroup({ density, className, wrap = false, ...props }: ToolbarGroupProps): ReactElement {
  return (
    <ToolbarPrimitive.Group
      data-density={density}
      data-slot="toolbar-group"
      data-wrap={wrap ? "" : undefined}
      className={(state) =>
        cn(
          // A vertical group is a list of tools: each spans the group and starts its label at the shared leading edge.
          "flex items-center gap-control-gap data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          // Wrapped chips run in rows even inside a vertical toolbar, left-aligned, so a set of values reads as text does.
          wrap && "flex-wrap justify-start data-[orientation=vertical]:flex-row",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function ToolbarSeparator({
  density,
  className,
  ...props
}: ToolbarPrimitive.Separator.Props & IDensityProps): ReactElement {
  return (
    <ToolbarPrimitive.Separator
      data-density={density}
      data-slot="toolbar-separator"
      className={(state) =>
        cn(
          "shrink-0 self-stretch bg-border data-[orientation=vertical]:mx-1 data-[orientation=vertical]:w-px data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Toolbar, ToolbarButton, ToolbarLink, ToolbarInput, ToolbarGroup, ToolbarSeparator };
