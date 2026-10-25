import { ToggleGroup, ToggleGroupItem } from "../../index.js";
import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonButtonGroup = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"ButtonGroup">>) => {
  const buttons = props.buttons ?? [];
  const [boundSelected, setBoundSelected] = useBoundProp<string>(props.selected ?? undefined, bindings?.selected);
  const [localValue, setLocalValue] = useState(props.selected ?? buttons[0]?.value ?? "");
  const isBound = !!bindings?.selected;
  const value = isBound ? (boundSelected ?? "") : localValue;
  const setValue = isBound ? setBoundSelected : setLocalValue;

  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
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
