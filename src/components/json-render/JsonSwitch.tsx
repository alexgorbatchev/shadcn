import { useId, useState } from "react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Field, FieldLabel } from "../../index.js";
import { Switch } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import {
  JsonFieldMessage,
  JsonFieldTags,
  JsonFieldValue,
  NOT_SET_TEXT,
  useJsonField,
  useJsonForm,
} from "./JsonForm.js";

/**
 * A toggle switch. Bound to a value the author left `null`, it reads "Not set" beside an off switch until the person
 * turns it on or off, so it never shows "off" as an answer it would not send.
 */
export const JsonSwitch = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Switch">>) => {
  const id = useId();
  const notSetId = useId();
  const form = useJsonForm();
  const [boundChecked, setBoundChecked] = useBoundProp<boolean>(props.checked ?? undefined, bindings?.checked);
  const [localChecked, setLocalChecked] = useState(!!props.checked);
  const isBound = !!bindings?.checked;
  const checked = isBound ? (boundChecked ?? false) : localChecked;
  const isNotSet = isBound && (boundChecked === null || boundChecked === undefined);
  const setChecked = isBound ? setBoundChecked : setLocalChecked;

  const validateOn = props.validateOn ?? "change";
  // Inside a JsonFormProvider the consumer owns the field's messages.
  const hasValidation = !!(bindings?.checked && props.checks?.length) && !form;
  const { errors, validate } = useFieldValidation(
    bindings?.checked ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const field = useJsonField({ path: bindings?.checked, label: props.label, checks: props.checks, ownErrors: errors });
  if (field.mode === "values")
    return <JsonFieldValue field={field} text={isNotSet ? NOT_SET_TEXT : checked ? "On" : "Off"} />;
  const describedBy =
    [field.controlProps["aria-describedby"], isNotSet ? notSetId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1">
      <Field orientation="horizontal">
        <Switch
          id={id}
          checked={checked}
          indeterminate={isNotSet}
          disabled={field.mode === "locked"}
          {...field.controlProps}
          aria-describedby={describedBy}
          onCheckedChange={(c) => {
            setChecked(c);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        />
        {/* The switch leads its label like JsonCheckbox so sibling controls align on one edge and tags sit beside the label. */}
        <div className="flex flex-auto flex-wrap items-center gap-2">
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <JsonFieldTags field={field} />
          {isNotSet && (
            <span
              id={notSetId}
              data-slot="json-field-not-set"
              className="shrink-0 text-sm whitespace-nowrap text-muted-foreground"
            >
              {NOT_SET_TEXT}
            </span>
          )}
        </div>
      </Field>
      <JsonFieldMessage field={field} />
    </div>
  );
};
