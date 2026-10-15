import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "../utils/cn.js";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type AccordionProps = AccordionPrimitive.Root.Props & IDensityProps;

function Accordion({ density, className, ...props }: AccordionProps): ReactElement {
  return (
    <AccordionPrimitive.Root
      data-density={density}
      data-slot="accordion"
      className={(state) => cn("flex w-full flex-col", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type AccordionItemProps = AccordionPrimitive.Item.Props & IDensityProps;

function AccordionItem({ density, className, ...props }: AccordionItemProps): ReactElement {
  return (
    <AccordionPrimitive.Item
      data-density={density}
      data-slot="accordion-item"
      className={(state) => cn("not-last:border-b", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & IDensityProps;

function AccordionTrigger({ density, className, children, ...props }: AccordionTriggerProps): ReactElement {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-density={density}
        data-slot="accordion-trigger"
        className={(state) =>
          cn(
            "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-sm border border-transparent py-2.5 text-start text-sm font-medium transition-colors outline-none hover:underline focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ms-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
            typeof className === "function" ? className(state) : className,
          )
        }
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

function AccordionContent({ density, className, children, ...props }: AccordionContentProps): ReactElement {
  return (
    <AccordionPrimitive.Panel
      data-density={density}
      data-slot="accordion-content"
      className={(state) =>
        cn(
          "h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <div className="pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
