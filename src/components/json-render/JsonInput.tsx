import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Input } from "../../index.js";
import { Label } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonInput = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Input">>) => {
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
      <Input
        id={id}
        name={props.name ?? undefined}
        type={props.type ?? "text"}
        placeholder={props.placeholder ?? ""}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") emit("submit");
        }}
        onFocus={() => emit("focus")}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
          emit("blur");
        }}
      />
      {errors.length > 0 && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
};
