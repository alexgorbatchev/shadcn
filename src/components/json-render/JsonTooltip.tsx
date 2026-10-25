import { type BaseComponentProps } from "@json-render/react";
import { Tooltip as TooltipPrimitive } from "../../index.js";
import { TooltipContent } from "../../index.js";
import { Button } from "../../index.js";
import { TooltipProvider } from "../../index.js";
import { TooltipTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonTooltip = ({ props }: BaseComponentProps<JsonProps<"Tooltip">>) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive>
        <TooltipTrigger render={<Button variant="link" />}>{props.text}</TooltipTrigger>
        <TooltipContent>
          <p>{props.content}</p>
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
};
