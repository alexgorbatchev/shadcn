import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Button } from "../../index.js";
import { DropdownMenu as DropdownMenuPrimitive } from "../../index.js";
import { DropdownMenuContent } from "../../index.js";
import { DropdownMenuItem } from "../../index.js";
import { DropdownMenuTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonDropdownMenu = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"DropdownMenu">>) => {
  const items = props.items ?? [];
  const [, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  return (
    <DropdownMenuPrimitive>
      <DropdownMenuTrigger render={<Button variant="outline" />}>{props.label}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => {
              setBoundValue(item.value);
              emit("select");
            }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
};
