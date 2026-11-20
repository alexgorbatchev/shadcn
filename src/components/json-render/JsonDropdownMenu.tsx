import { useId } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Button } from "../../index.js";
import { DropdownMenu as DropdownMenuPrimitive } from "../../index.js";
import { DropdownMenuContent } from "../../index.js";
import { DropdownMenuItem } from "../../index.js";
import { DropdownMenuRadioGroup } from "../../index.js";
import { DropdownMenuRadioItem } from "../../index.js";
import { DropdownMenuTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldLabel, JsonFieldValue, useJsonField } from "./JsonForm.js";

/**
 * A menu of actions, or with a bound value a choice: the label then names the question, the trigger shows the chosen
 * item ("Choose…" before a choice) and the open menu marks the chosen item checked.
 */
export const JsonDropdownMenu = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"DropdownMenu">>) => {
  const labelId = useId();
  const items = props.items ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const field = useJsonField({ path: bindings?.value, label: props.label });
  if (!bindings?.value)
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
  const chosen = items.find((item) => item.value === boundValue);
  if (field.mode === "values") return <JsonFieldValue field={field} text={chosen?.label ?? ""} />;
  return (
    <div className="space-y-2">
      <JsonFieldLabel field={field} id={labelId} />
      <DropdownMenuPrimitive>
        <DropdownMenuTrigger
          render={<Button variant="outline" />}
          disabled={field.mode === "locked"}
          aria-labelledby={field.label ? `${labelId} ${labelId}-value` : undefined}
        >
          <span id={`${labelId}-value`}>{chosen?.label ?? "Choose…"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={chosen?.value ?? ""}
            onValueChange={(value: string) => {
              setBoundValue(value);
              emit("select");
            }}
          >
            {items.map((item) => (
              <DropdownMenuRadioItem key={item.value} value={item.value} closeOnClick>
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenuPrimitive>
    </div>
  );
};
