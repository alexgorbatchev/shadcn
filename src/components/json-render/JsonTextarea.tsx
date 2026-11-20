import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Textarea } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldLabel, JsonFieldMessage, JsonFieldValue, useJsonField, useJsonForm } from "./JsonForm.js";
export const JsonTextarea = ({ props, bindings }: BaseComponentProps<JsonProps<"Textarea">>) => {
  const id = useId();
  const form = useJsonForm();
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const validateOn = props.validateOn ?? "blur";

  // Inside a JsonFormProvider the consumer owns the field's messages.
  const hasValidation = !!(bindings?.value && props.checks?.length) && !form;
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const field = useJsonField({ path: bindings?.value, label: props.label, checks: props.checks, ownErrors: errors });
  if (field.mode === "values") return <JsonFieldValue field={field} text={value} />;

  return (
    <div className="w-full space-y-2">
      <JsonFieldLabel field={field} htmlFor={id} />
      <Textarea
        id={id}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        rows={props.rows ?? 3}
        value={value}
        disabled={field.mode === "locked"}
        {...field.controlProps}
        onChange={(e) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
        }}
      />
      <JsonFieldMessage field={field} />
    </div>
  );
};
