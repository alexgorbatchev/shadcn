import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { Density, IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import type { VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { buttonVariants } from "./Button.js";
import { cn } from "../utils/cn.js";

type ButtonLinkState = { slot: "button-link"; density?: Density };
type ButtonLinkProps = IAnalyticsProps &
  useRender.ComponentProps<"a", ButtonLinkState> &
  VariantProps<typeof buttonVariants> &
  IDensityProps;

function ButtonLink({
  analytics,
  density,
  className,
  variant = "default",
  size = "default",
  align = "center",
  truncate = false,
  fullWidth = false,
  render,
  children,
  ...props
}: ButtonLinkProps): ReactElement {
  const onClick = useAnalyticsCallback("ButtonLink", analytics, { name: "ui.activate" }, props.onClick);
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(buttonVariants({ variant, size, align, truncate, fullWidth }), className),
        children: truncate ? <span className="min-w-0 truncate">{children}</span> : children,
      },
      { ...props, onClick },
    ),
    render,
    state: {
      slot: "button-link",
      density,
    },
  });
}

export { ButtonLink };
