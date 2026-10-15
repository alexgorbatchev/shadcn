import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

import { Separator } from "./Separator";

type ItemGroupProps = ComponentProps<"div"> & IDensityProps;

function ItemGroup({ density, className, ...props }: ItemGroupProps): ReactElement {
  return (
    <div
      role="list"
      data-density={density}
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className,
      )}
      {...props}
    />
  );
}

type ItemSeparatorProps = ComponentProps<typeof Separator> & IDensityProps;

function ItemSeparator({ density, className, ...props }: ItemSeparatorProps): ReactElement {
  return (
    <Separator
      data-density={density}
      data-slot="item-separator"
      orientation="horizontal"
      className={(state) => cn("my-2", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-sm border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-panel p-panel",
        sm: "gap-panel p-panel",
        xs: "gap-2 px-control-x py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ItemProps = useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants> & IDensityProps;

function Item({
  density,
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: ItemProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(itemVariants({ variant, size, className })),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "item",
      variant,
      size,
    },
  });
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ItemMediaProps = ComponentProps<"div"> & VariantProps<typeof itemMediaVariants> & IDensityProps;

function ItemMedia({ density, className, variant = "default", ...props }: ItemMediaProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

type ItemContentProps = ComponentProps<"div"> & IDensityProps;

function ItemContent({ density, className, ...props }: ItemContentProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className,
      )}
      {...props}
    />
  );
}

type ItemTitleProps = ComponentProps<"div"> & IDensityProps;

function ItemTitle({ density, className, ...props }: ItemTitleProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

type ItemDescriptionProps = ComponentProps<"p"> & IDensityProps;

function ItemDescription({ density, className, ...props }: ItemDescriptionProps): ReactElement {
  return (
    <p
      data-density={density}
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-start text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

type ItemActionsProps = ComponentProps<"div"> & IDensityProps;

function ItemActions({ density, className, ...props }: ItemActionsProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

type ItemHeaderProps = ComponentProps<"div"> & IDensityProps;

function ItemHeader({ density, className, ...props }: ItemHeaderProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-header"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

type ItemFooterProps = ComponentProps<"div"> & IDensityProps;

function ItemFooter({ density, className, ...props }: ItemFooterProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="item-footer"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
