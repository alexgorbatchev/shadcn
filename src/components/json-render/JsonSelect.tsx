import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Select } from "../../index.js";
import { SelectContent } from "../../index.js";
import { SelectItem } from "../../index.js";
import { SelectTrigger } from "../../index.js";
import { SelectValue } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldLabel, JsonFieldMessage, JsonFieldValue, useJsonField, useJsonForm } from "./JsonForm.js";
export const JsonSelect = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Select">>) => {
  const id = useId();
  const form = useJsonForm();
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState<string>(props.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const rawOptions = props.options ?? [];
  const options = rawOptions.map((opt) => (typeof opt === "string" ? opt : String(opt ?? "")));
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
      <JsonFieldLabel field={field} htmlFor={id} />
      <Select
        value={value}
        disabled={field.mode === "locked"}
        onValueChange={(v) => {
          setValue(v ?? "");
          // Select has no native blur event, so only validate on "change"
          if (hasValidation && validateOn === "change") validate();
          emit("change");
        }}
      >
        <SelectTrigger id={id} className="w-full" {...field.controlProps}>
          <SelectValue placeholder={props.placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, idx) => (
            <SelectItem key={`${idx}-${opt}`} value={opt || `option-${idx}`}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <JsonFieldMessage field={field} />
    </div>
  );
};
