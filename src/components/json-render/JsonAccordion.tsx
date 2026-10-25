import { type BaseComponentProps } from "@json-render/react";
import { Accordion as AccordionPrimitive } from "../../index.js";
import { AccordionContent } from "../../index.js";
import { AccordionItem } from "../../index.js";
import { AccordionTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonAccordion = ({ props }: BaseComponentProps<JsonProps<"Accordion">>) => {
  const items = props.items ?? [];
  const isMultiple = props.type === "multiple";

  const itemElements = items.map((item, i) => (
    <AccordionItem key={i} value={`item-${i}`}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.content}</AccordionContent>
    </AccordionItem>
  ));

  if (isMultiple) {
    return (
      <AccordionPrimitive multiple className="w-full">
        {itemElements}
      </AccordionPrimitive>
    );
  }
  return (
    <AccordionPrimitive multiple={false} className="w-full">
      {itemElements}
    </AccordionPrimitive>
  );
};
