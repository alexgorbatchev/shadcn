import type { IDensityProps } from "../density/types";
import type { ReactElement } from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "../utils/cn";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type AccordionProps = AccordionPrimitive.Root.Props & IDensityProps;

function Accordion({ density, className, ...props }: AccordionProps): ReactElement | null {
  return (
    <AccordionPrimitive.Root
      data-density={density}
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

type AccordionItemProps = AccordionPrimitive.Item.Props & IDensityProps;

function AccordionItem({ density, className, ...props }: AccordionItemProps): ReactElement | null {
  return (
    <AccordionPrimitive.Item
      data-density={density}
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & IDensityProps;

function AccordionTrigger({ density, className, children, ...props }: AccordionTriggerProps): ReactElement | null {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-density={density}
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-sm border border-transparent py-2.5 text-left text-sm font-medium transition-colors outline-none hover:underline focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

type AccordionContentProps = AccordionPrimitive.Panel.Props & IDensityProps;

function AccordionContent({ density, className, children, ...props }: AccordionContentProps): ReactElement | null {
  return (
    <AccordionPrimitive.Panel
      data-density={density}
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
