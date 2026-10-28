import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn.js";

type TabsProps = IAnalyticsProps & TabsPrimitive.Root.Props & IDensityProps;

function Tabs({ analytics, density, className, orientation = "horizontal", ...props }: TabsProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "Tabs",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return (
    <TabsPrimitive.Root
      data-density={density}
      data-slot="tabs"
      orientation={orientation}
      className={(state) =>
        cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-sm p-px text-muted-foreground group-data-[orientation=horizontal]/tabs:h-control group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
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

function TabsList({ density, className, variant = "default", ...props }: TabsListProps): ReactElement {
  return (
    <TabsPrimitive.List
      data-density={density}
      data-slot="tabs-list"
      data-variant={variant}
      className={(state) =>
        cn(tabsListVariants({ variant }), typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

type TabsTriggerProps = TabsPrimitive.Tab.Props & IDensityProps;

function TabsTrigger({ density, className, ...props }: TabsTriggerProps): ReactElement {
  return (
    <TabsPrimitive.Tab
      data-density={density}
      data-slot="tabs-trigger"
      className={(state) =>
        cn(
          "relative inline-flex h-full flex-1 items-center justify-center gap-control-gap rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pe-1 has-data-[icon=inline-start]:ps-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent",
          "data-active:bg-background data-active:text-foreground",
          "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-end-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type TabsContentProps = TabsPrimitive.Panel.Props & IDensityProps;

function TabsContent({ density, className, ...props }: TabsContentProps): ReactElement {
  return (
    <TabsPrimitive.Panel
      data-density={density}
      data-slot="tabs-content"
      data-scroll="none"
      className={(state) =>
        cn("flex-1 text-sm outline-none", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
