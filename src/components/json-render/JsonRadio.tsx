import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Label, Field, FieldLabel } from "../../index.js";
import { RadioGroup } from "../../index.js";
import { RadioGroupItem } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonRadio = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Radio">>) => {
  const id = useId();
  const rawOptions = props.options ?? [];
  const options = rawOptions.map((opt) => (typeof opt === "string" ? opt : String(opt ?? "")));
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? options[0] ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;

  const validateOn = props.validateOn ?? "change";
  const hasValidation = !!(bindings?.value && props.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );

  return (
    <div className="space-y-2">
      {props.label && <Label id={id}>{props.label}</Label>}
      <RadioGroup
        aria-labelledby={props.label ? id : undefined}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          if (hasValidation && validateOn === "change") validate();
          emit("change");
        }}
      >
        {options.map((opt, idx) => (
          <Field key={`${idx}-${opt}`} orientation="horizontal">
            <RadioGroupItem value={opt || `option-${idx}`} id={`${id}-${idx}`} />
            <FieldLabel htmlFor={`${id}-${idx}`}>{opt}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      {errors.length > 0 && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
};
