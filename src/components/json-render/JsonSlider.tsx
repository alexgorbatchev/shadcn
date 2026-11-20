import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Label } from "../../index.js";
import { Slider } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldTags, JsonFieldValue, NOT_SET_TEXT, useJsonField } from "./JsonForm.js";

/**
 * A range slider. Bound to a value the author left `null`, it reads "Not set" instead of its minimum until the person
 * moves it, so it never shows a value it would not send.
 */
export const JsonSlider = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Slider">>) => {
  const id = useId();
  const [boundValue, setBoundValue] = useBoundProp<number>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? props.min ?? 0);
  const isBound = !!bindings?.value;
  const isNotSet = isBound && (boundValue === null || boundValue === undefined);
  const value = isBound ? (boundValue ?? props.min ?? 0) : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const field = useJsonField({ path: bindings?.value, label: props.label });
  const valueText = isNotSet ? NOT_SET_TEXT : String(value);
  if (field.mode === "values") return <JsonFieldValue field={field} text={valueText} />;

  return (
    <div className="space-y-2">
      {(field.label || isNotSet) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {field.label && (
              <Label id={id} className="text-sm">
                {field.label}
              </Label>
            )}
            <JsonFieldTags field={field} />
          </div>
          <span data-slot={isNotSet ? "json-field-not-set" : undefined} className="text-sm text-muted-foreground">
            {valueText}
          </span>
        </div>
      )}
      <Slider
        getAriaLabel={() => field.label || "Value"}
        getAriaValueText={isNotSet ? () => NOT_SET_TEXT : undefined}
        value={[value]}
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        disabled={field.mode === "locked"}
        onValueChange={(v) => {
          setValue(v[0] ?? 0);
          emit("change");
        }}
      />
    </div>
  );
};
