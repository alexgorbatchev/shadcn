"use client";

import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

import { Label } from "./Label";
import { Separator } from "./Separator";

type FieldSetProps = ComponentProps<"fieldset"> & IDensityProps;

function FieldSet({ density, className, ...props }: FieldSetProps): ReactElement {
  return (
    <fieldset
      data-density={density}
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

type FieldLegendProps = ComponentProps<"legend"> & { variant?: "legend" | "label" } & IDensityProps;

function FieldLegend({ density, className, variant = "legend", ...props }: FieldLegendProps): ReactElement {
  return (
    <legend
      data-density={density}
      data-slot="field-legend"
      data-variant={variant}
      className={cn("mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", className)}
      {...props}
    />
  );
}

type FieldGroupProps = ComponentProps<"div"> & IDensityProps;

function FieldGroup({ density, className, ...props }: FieldGroupProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-field-gap data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

type FieldProps = ComponentProps<"div"> & VariantProps<typeof fieldVariants> & IDensityProps;

function Field({ density, className, orientation = "vertical", ...props }: FieldProps): ReactElement {
  return (
    <div
      role="group"
      data-density={density}
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

type FieldContentProps = ComponentProps<"div"> & IDensityProps;

function FieldContent({ density, className, ...props }: FieldContentProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", className)}
      {...props}
    />
  );
}

type FieldLabelProps = ComponentProps<typeof Label> & IDensityProps;

function FieldLabel({ density, className, ...props }: FieldLabelProps): ReactElement {
  return (
    <Label
      data-density={density}
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-sm has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring *:data-[slot=field]:p-2.5",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

type FieldTitleProps = ComponentProps<"div"> & IDensityProps;

function FieldTitle({ density, className, ...props }: FieldTitleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type FieldDescriptionProps = ComponentProps<"p"> & IDensityProps;

function FieldDescription({ density, className, ...props }: FieldDescriptionProps): ReactElement {
  return (
    <p
      data-density={density}
      data-slot="field-description"
      className={cn(
        "text-start text-sm leading-normal font-normal text-muted-foreground group-data-[orientation=horizontal]/field:text-balance @md/field-group:group-data-[orientation=responsive]/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

type FieldSeparatorProps = ComponentProps<"div"> & IDensityProps;

function FieldSeparator({ density, children, className, ...props }: FieldSeparatorProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

type FieldErrorProps = ComponentProps<"div"> & {
  errors?: ReadonlyArray<{ message?: string } | undefined>;
} & IDensityProps;

function FieldError({ density, className, children, errors, ...props }: FieldErrorProps): ReactElement | null {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueMessages = [
      ...new Set(
        errors
          .map((error) => error?.message)
          .filter((message): message is string => typeof message === "string" && message.length > 0),
      ),
    ];

    if (!uniqueMessages.length) return null;

    if (uniqueMessages.length === 1) {
      return uniqueMessages[0];
    }

    return (
      <ul className="ms-4 flex list-disc flex-col gap-1">
        {uniqueMessages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-density={density}
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
