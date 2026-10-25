import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Field, FieldLabel } from "../../index.js";
import { Switch } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonSwitch = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Switch">>) => {
  const id = useId();
  const [boundChecked, setBoundChecked] = useBoundProp<boolean>(props.checked ?? undefined, bindings?.checked);
  const [localChecked, setLocalChecked] = useState(!!props.checked);
  const isBound = !!bindings?.checked;
  const checked = isBound ? (boundChecked ?? false) : localChecked;
  const setChecked = isBound ? setBoundChecked : setLocalChecked;

  const validateOn = props.validateOn ?? "change";
  const hasValidation = !!(bindings?.checked && props.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindings?.checked ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );

  return (
    <div className="space-y-1">
      <Field orientation="horizontal">
        <FieldLabel htmlFor={id}>{props.label}</FieldLabel>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={(c) => {
            setChecked(c);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        />
      </Field>
      {errors.length > 0 && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
};
