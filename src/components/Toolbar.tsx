import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import { useAnalyticsInput } from "../hooks/useAnalyticsInput.js";
import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { cn } from "../utils/cn.js";
import { buttonVariants } from "./Button.js";

function Toolbar({ density, className, ...props }: ToolbarPrimitive.Root.Props & IDensityProps): ReactElement {
  return (
    <ToolbarPrimitive.Root
      data-density={density}
      data-slot="toolbar"
      data-scroll="none"
      className={(state) =>
        cn(
          "flex min-w-0 gap-control-gap rounded-sm border border-border bg-card p-1 text-card-foreground data-[orientation=vertical]:flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function ToolbarButton({
  analytics,
  density,
  className,
  ...props
}: ToolbarPrimitive.Button.Props & IDensityProps & IAnalyticsProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("ToolbarButton", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <ToolbarPrimitive.Button
      data-density={density}
      data-slot="toolbar-button"
      className={(state) =>
        cn(
          buttonVariants({ variant: "ghost" }),
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
  ...props
}: ToolbarPrimitive.Link.Props & IDensityProps & IAnalyticsProps): ReactElement {
  const trackedOnClick = useAnalyticsCallback("ToolbarLink", analytics, { name: "ui.activate" }, props.onClick);

  return (
    <ToolbarPrimitive.Link
      data-density={density}
      data-slot="toolbar-link"
      className={(state) =>
        cn(buttonVariants({ variant: "ghost" }), typeof className === "function" ? className(state) : className)
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

function ToolbarGroup({ density, className, ...props }: ToolbarPrimitive.Group.Props & IDensityProps): ReactElement {
  return (
    <ToolbarPrimitive.Group
      data-density={density}
      data-slot="toolbar-group"
      className={(state) =>
        cn(
          "flex items-center gap-control-gap data-[orientation=vertical]:flex-col",
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
