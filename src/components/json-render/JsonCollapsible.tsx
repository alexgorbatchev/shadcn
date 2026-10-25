import { Button } from "../../index.js";
import { useState } from "react";
import { type BaseComponentProps } from "@json-render/react";
import { Collapsible } from "../../index.js";
import { CollapsibleContent } from "../../index.js";
import { CollapsibleTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonCollapsible = ({ props, children }: BaseComponentProps<JsonProps<"Collapsible">>) => {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger render={<Button variant="outline" fullWidth align="start" />}>
        {props.title}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};
