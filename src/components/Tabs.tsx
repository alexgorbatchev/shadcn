import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

type TabsProps = TabsPrimitive.Root.Props & IDensityProps;

function Tabs({ density, className, orientation = "horizontal", ...props }: TabsProps): ReactElement | null {
  return (
    <TabsPrimitive.Root
      data-density={density}
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-sm p-[3px] text-muted-foreground group-data-horizontal/tabs:h-control group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TabsListProps = TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants> & IDensityProps;

function TabsList({ density, className, variant = "default", ...props }: TabsListProps): ReactElement | null {
  return (
    <TabsPrimitive.List
      data-density={density}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

type TabsTriggerProps = TabsPrimitive.Tab.Props & IDensityProps;

function TabsTrigger({ density, className, ...props }: TabsTriggerProps): ReactElement | null {
  return (
    <TabsPrimitive.Tab
      data-density={density}
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-control-gap rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = TabsPrimitive.Panel.Props & IDensityProps;

function TabsContent({ density, className, ...props }: TabsContentProps): ReactElement | null {
  return (
    <TabsPrimitive.Panel
      data-density={density}
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
