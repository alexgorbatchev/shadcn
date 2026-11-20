import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { ToggleGroup } from "../../index.js";
import { ToggleGroupItem } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldValue, useJsonField } from "./JsonForm.js";
export const JsonToggleGroup = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"ToggleGroup">>) => {
  const type = props.type ?? "single";
  const items = props.items ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? items[0]?.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const field = useJsonField({ path: bindings?.value });
  // Only a bound group is an answer; an unbound one switches a view and keeps working in every mode.
  const mode = isBound ? field.mode : "edit";
  const selected = value ? value.split(",") : [];
  if (mode === "values")
    return (
      <JsonFieldValue
        field={field}
        text={items
          .filter((item) => selected.includes(item.value))
          .map((item) => item.label)
          .join(", ")}
      />
    );

  return (
    <ToggleGroup
      multiple={type === "multiple"}
      disabled={mode === "locked"}
      value={selected}
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
