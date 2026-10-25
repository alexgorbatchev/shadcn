import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Label } from "../../index.js";
import { Textarea } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonTextarea = ({ props, bindings }: BaseComponentProps<JsonProps<"Textarea">>) => {
  const id = useId();
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const validateOn = props.validateOn ?? "blur";

  const hasValidation = !!(bindings?.value && props.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );

  return (
    <div className="space-y-2">
      {props.label && <Label htmlFor={id}>{props.label}</Label>}
      <Textarea
        id={id}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        rows={props.rows ?? 3}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
        }}
      />
      {errors.length > 0 && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
};
