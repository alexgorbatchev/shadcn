import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Field, FieldLabel } from "../../index.js";
import { RadioGroup } from "../../index.js";
import { RadioGroupItem } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldLabel, JsonFieldMessage, JsonFieldValue, useJsonField, useJsonForm } from "./JsonForm.js";
export const JsonRadio = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Radio">>) => {
  const id = useId();
  const form = useJsonForm();
  const rawOptions = props.options ?? [];
  const options = rawOptions.map((opt) => (typeof opt === "string" ? opt : String(opt ?? "")));
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? options[0] ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;

  const validateOn = props.validateOn ?? "change";
  // Inside a JsonFormProvider the consumer owns the field's messages.
  const hasValidation = !!(bindings?.value && props.checks?.length) && !form;
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const field = useJsonField({ path: bindings?.value, label: props.label, checks: props.checks, ownErrors: errors });
  if (field.mode === "values") return <JsonFieldValue field={field} text={value} />;

  return (
    <div className="space-y-2">
      <JsonFieldLabel field={field} id={id} />
      <RadioGroup
        aria-labelledby={field.label ? id : undefined}
        // Focusable from script only, so a consumer can focus the labelled group rather than an unchecked option.
        tabIndex={-1}
        value={value}
        disabled={field.mode === "locked"}
        {...field.controlProps}
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
      <JsonFieldMessage field={field} />
    </div>
  );
};
