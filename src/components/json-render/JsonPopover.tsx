import { type BaseComponentProps } from "@json-render/react";
import { Button } from "../../index.js";
import { Popover as PopoverPrimitive } from "../../index.js";
import { PopoverContent } from "../../index.js";
import { PopoverTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonPopover = ({ props }: BaseComponentProps<JsonProps<"Popover">>) => {
  return (
    <PopoverPrimitive>
      <PopoverTrigger render={<Button variant="outline" />}>{props.trigger}</PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="text-sm">{props.content}</p>
      </PopoverContent>
    </PopoverPrimitive>
  );
};
