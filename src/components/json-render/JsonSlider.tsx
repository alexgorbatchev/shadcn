import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Label } from "../../index.js";
import { Slider } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonSlider = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Slider">>) => {
  const id = useId();
  const [boundValue, setBoundValue] = useBoundProp<number>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? props.min ?? 0);
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? props.min ?? 0) : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;

  return (
    <div className="space-y-2">
      {props.label && (
        <div className="flex justify-between">
          <Label id={id} className="text-sm">
            {props.label}
          </Label>
          <span className="text-sm text-muted-foreground">{value}</span>
        </div>
      )}
      <Slider
        getAriaLabel={() => props.label ?? "Value"}
        value={[value]}
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        onValueChange={(v) => {
          setValue(v[0] ?? 0);
          emit("change");
        }}
      />
    </div>
  );
};
