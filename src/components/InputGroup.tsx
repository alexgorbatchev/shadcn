import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { cn } from "../utils/cn.js";

import { Button } from "./Button.js";
import { Input } from "./Input.js";
import { Textarea } from "./Textarea.js";

type InputGroupProps = ComponentProps<"div"> & IDensityProps;

function InputGroup({ density, className, ...props }: InputGroupProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-control w-full min-w-0 items-center rounded-sm border border-input transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-muted has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pe-1.5 has-[>[data-align=inline-start]]:[&>input]:ps-1.5",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-2 has-[>button]:ms-[-0.3rem] has-[>kbd]:ms-[-0.15rem]",
        "inline-end": "order-last pe-2 has-[>button]:me-[-0.3rem] has-[>kbd]:me-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-control-x pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-control-x pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

type InputGroupAddonProps = ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants> & IDensityProps;

function InputGroupAddon({ density, className, align = "inline-start", ...props }: InputGroupAddonProps): ReactElement {
  return (
    <div
      role="group"
      data-density={density}
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...mergeProps<"div">(
        {
          onClick(event) {
            if (
              event.defaultPrevented ||
              !(event.target instanceof Node) ||
              !event.currentTarget.contains(event.target) ||
              (event.target instanceof Element && event.target.closest("button, a[href], input, textarea, select"))
            ) {
              return;
            }
            event.currentTarget.parentElement
              ?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                "input[data-slot=input-group-control], textarea[data-slot=input-group-control]",
              )
              ?.focus();
          },
        },
        props,
      )}
    />
  );
}

const inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
  variants: {
    size: {
      xs: "h-control-xs gap-1 rounded-sm px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-control-sm",
      "icon-xs": "size-control-xs rounded-sm p-0 has-[>svg]:p-0",
      "icon-sm": "size-control-sm p-0 has-[>svg]:p-0",
    },
  },
  defaultVariants: {
    size: "xs",
  },
});

type InputGroupButtonProps = Omit<ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  } & IDensityProps;

function InputGroupButton({
  density,
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: InputGroupButtonProps): ReactElement {
  return (
    <Button
      density={density}
      type={type}
      data-size={size}
      variant={variant}
      className={(state) =>
        cn(inputGroupButtonVariants({ size }), typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type InputGroupTextProps = ComponentProps<"span"> & IDensityProps;

function InputGroupText({ density, className, ...props }: InputGroupTextProps): ReactElement {
  return (
    <span
      data-density={density}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupInputProps = ComponentProps<typeof Input>;

function InputGroupInput({ density, className, ...props }: InputGroupInputProps): ReactElement {
  return (
    <Input
      density={density}
      data-slot="input-group-control"
      className={(state) =>
        cn(
          "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type InputGroupTextareaProps = ComponentProps<"textarea"> & IDensityProps;

function InputGroupTextarea({ density, className, ...props }: InputGroupTextareaProps): ReactElement {
  return (
    <Textarea
      density={density}
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea };
