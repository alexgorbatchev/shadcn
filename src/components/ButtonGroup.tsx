import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

import { Separator } from "./Separator.js";

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-e-sm [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "*:data-slot:rounded-e-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-e-sm! [&>[data-slot]~[data-slot]]:rounded-s-none [&>[data-slot]~[data-slot]]:border-s-0",
        vertical:
          "flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-sm! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

type ButtonGroupProps = ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants> & IDensityProps;

function ButtonGroup({ density, className, orientation, ...props }: ButtonGroupProps): ReactElement {
  return (
    <div
      role="group"
      data-density={density}
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

type ButtonGroupTextProps = useRender.ComponentProps<"div"> & IDensityProps;

function ButtonGroupText({ density, className, render, ...props }: ButtonGroupTextProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex items-center gap-2 rounded-sm border bg-muted px-control-x text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "button-group-text",
    },
  });
}

function ButtonGroupSeparator({
  density,
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<typeof Separator>): ReactElement {
  return (
    <Separator
      data-density={density}
      data-slot="button-group-separator"
      orientation={orientation}
      className={(state) =>
        cn(
          "relative self-stretch bg-input data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
