import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Label } from "../../index.js";
import { Select } from "../../index.js";
import { SelectContent } from "../../index.js";
import { SelectItem } from "../../index.js";
import { SelectTrigger } from "../../index.js";
import { SelectValue } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonSelect = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Select">>) => {
  const id = useId();
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState<string>(props.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const rawOptions = props.options ?? [];
  const options = rawOptions.map((opt) => (typeof opt === "string" ? opt : String(opt ?? "")));
  const validateOn = props.validateOn ?? "change";

  const hasValidation = !!(bindings?.value && props.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{props.label}</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v ?? "");
          // Select has no native blur event, so only validate on "change"
          if (hasValidation && validateOn === "change") validate();
          emit("change");
        }}
      >
        <SelectTrigger id={id} className="w-full">
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
      {errors.length > 0 && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
};
