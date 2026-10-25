import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { ToggleGroup } from "../../index.js";
import { ToggleGroupItem } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonToggleGroup = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"ToggleGroup">>) => {
  const type = props.type ?? "single";
  const items = props.items ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? items[0]?.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;

  return (
    <ToggleGroup
      multiple={type === "multiple"}
      value={value ? value.split(",") : []}
      onValueChange={(values) => {
        setValue(values.join(","));
        emit("change");
      }}
    >
      {items.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value}>
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
