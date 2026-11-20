import { ToggleGroup, ToggleGroupItem } from "../../index.js";
import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
import { JsonFieldValue, useJsonField } from "./JsonForm.js";
export const JsonButtonGroup = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"ButtonGroup">>) => {
  const buttons = props.buttons ?? [];
  const [boundSelected, setBoundSelected] = useBoundProp<string>(props.selected ?? undefined, bindings?.selected);
  const [localValue, setLocalValue] = useState(props.selected ?? buttons[0]?.value ?? "");
  const isBound = !!bindings?.selected;
  const value = isBound ? (boundSelected ?? "") : localValue;
  const setValue = isBound ? setBoundSelected : setLocalValue;
  const field = useJsonField({ path: bindings?.selected });
  // Only a bound group is an answer; an unbound one switches a view and keeps working in every mode.
  const mode = isBound ? field.mode : "edit";
  if (mode === "values")
    return <JsonFieldValue field={field} text={buttons.find((button) => button.value === value)?.label ?? ""} />;

  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      disabled={mode === "locked"}
      value={value ? [value] : []}
      onValueChange={(values) => {
        setValue(values[0] ?? "");
        emit("change");
      }}
    >
      {buttons.map((button) => (
        <ToggleGroupItem key={button.value} value={button.value}>
          {button.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
