import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

type EmptyProps = ComponentProps<"div"> & IDensityProps;

function Empty({ density, className, ...props }: EmptyProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-md border-dashed p-panel text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}

type EmptyHeaderProps = ComponentProps<"div"> & IDensityProps;

function EmptyHeader({ density, className, ...props }: EmptyHeaderProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type EmptyMediaProps = ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants> & IDensityProps;

function EmptyMedia({ density, className, variant = "default", ...props }: EmptyMediaProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

type EmptyTitleProps = ComponentProps<"div"> & IDensityProps;

function EmptyTitle({ density, className, ...props }: EmptyTitleProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty-title"
      className={cn("text-sm font-medium tracking-tight", className)}
      {...props}
    />
  );
}

type EmptyDescriptionProps = ComponentProps<"div"> & IDensityProps;

function EmptyDescription({ density, className, ...props }: EmptyDescriptionProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

type EmptyContentProps = ComponentProps<"div"> & IDensityProps;

function EmptyContent({ density, className, ...props }: EmptyContentProps): ReactElement | null {
  return (
    <div
      data-density={density}
      data-slot="empty-content"
      className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance", className)}
      {...props}
    />
  );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
