import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-sm border p-panel text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success: "bg-card text-success *:data-[slot=alert-description]:text-success/90",
        warning: "bg-card text-warning *:data-[slot=alert-description]:text-warning/90",
        info: "bg-card text-primary *:data-[slot=alert-description]:text-primary/90",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants> & IDensityProps;

function Alert({ density, className, variant, ...props }: AlertProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

type AlertTitleProps = ComponentProps<"div"> & IDensityProps;

function AlertTitle({ density, className, ...props }: AlertTitleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type AlertDescriptionProps = ComponentProps<"div"> & IDensityProps;

function AlertDescription({ density, className, ...props }: AlertDescriptionProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

type AlertActionProps = ComponentProps<"div"> & IDensityProps;

function AlertAction({ density, className, ...props }: AlertActionProps): ReactElement {
  return (
    <div data-density={density} data-slot="alert-action" className={cn("absolute top-2 end-2", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
