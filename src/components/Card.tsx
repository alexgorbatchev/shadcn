import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

type CardProps = ComponentProps<"div"> & { size?: "default" | "sm" } & IDensityProps;

function Card({ density, className, size = "default", ...props }: CardProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-md bg-card py-(--card-spacing) text-sm text-card-foreground border border-border [--card-spacing:var(--ag-panel-padding)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:var(--ag-panel-padding-sm)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-md *:[img:last-child]:rounded-b-md",
        className,
      )}
      {...props}
    />
  );
}

type CardHeaderProps = ComponentProps<"div"> & IDensityProps;

function CardHeader({ density, className, ...props }: CardHeaderProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-md px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

type CardTitleProps = ComponentProps<"div"> & IDensityProps;

function CardTitle({ density, className, ...props }: CardTitleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card-title"
      className={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  );
}

type CardDescriptionProps = ComponentProps<"div"> & IDensityProps;

function CardDescription({ density, className, ...props }: CardDescriptionProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type CardActionProps = ComponentProps<"div"> & IDensityProps;

function CardAction({ density, className, ...props }: CardActionProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

type CardContentProps = ComponentProps<"div"> & IDensityProps;

function CardContent({ density, className, ...props }: CardContentProps): ReactElement {
  return (
    <div data-density={density} data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />
  );
}

type CardFooterProps = ComponentProps<"div"> & IDensityProps;

function CardFooter({ density, className, ...props }: CardFooterProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="card-footer"
      className={cn("flex items-center rounded-b-md border-t bg-muted/50 p-(--card-spacing)", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
