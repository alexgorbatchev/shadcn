import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Badge, Field, FieldLabel } from "../../index.js";
import { Switch } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldMessage, JsonFieldValue, useJsonField, useJsonForm } from "./JsonForm.js";
export const JsonSwitch = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Switch">>) => {
  const id = useId();
  const form = useJsonForm();
  const [boundChecked, setBoundChecked] = useBoundProp<boolean>(props.checked ?? undefined, bindings?.checked);
  const [localChecked, setLocalChecked] = useState(!!props.checked);
  const isBound = !!bindings?.checked;
  const checked = isBound ? (boundChecked ?? false) : localChecked;
  const setChecked = isBound ? setBoundChecked : setLocalChecked;

  const validateOn = props.validateOn ?? "change";
  // Inside a JsonFormProvider the consumer owns the field's messages.
  const hasValidation = !!(bindings?.checked && props.checks?.length) && !form;
  const { errors, validate } = useFieldValidation(
    bindings?.checked ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const field = useJsonField({ path: bindings?.checked, label: props.label, checks: props.checks, ownErrors: errors });
  if (field.mode === "values") return <JsonFieldValue field={field} text={checked ? "On" : "Off"} />;

  return (
    <div className="space-y-1">
      <Field orientation="horizontal">
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        {field.isRequired && <Badge variant="outline">Required</Badge>}
        <Switch
          id={id}
          checked={checked}
          disabled={field.mode === "locked"}
          {...field.controlProps}
          onCheckedChange={(c) => {
            setChecked(c);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        />
      </Field>
      <JsonFieldMessage field={field} />
    </div>
  );
};
