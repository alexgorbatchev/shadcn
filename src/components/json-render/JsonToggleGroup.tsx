import { useId, useState } from "react";
import { CheckIcon } from "lucide-react";
import { useBoundProp } from "@json-render/react";
import { useFieldValidation } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { ToggleGroup } from "../../index.js";
import { ToggleGroupItem } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldLabel, JsonFieldMessage, JsonFieldValue, useJsonField, useJsonForm } from "./JsonForm.js";

/**
 * A group of toggle buttons. Bound to an answer it is a question: its label sits above the options and names the group,
 * pressed options show a check, and its checks validate it. Unbound it switches a view and keeps working in every mode.
 */
export const JsonToggleGroup = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"ToggleGroup">>) => {
  const labelId = useId();
  const descriptionId = useId();
  const form = useJsonForm();
  const type = props.type ?? "single";
  const items = props.items ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? items[0]?.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  // Inside a JsonFormProvider the consumer owns the field's messages.
  const hasValidation = isBound && !!props.checks?.length && !form;
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? "",
    hasValidation ? { checks: props.checks ?? [], validateOn: "change" } : undefined,
  );
  const field = useJsonField({ path: bindings?.value, label: props.label, checks: props.checks, ownErrors: errors });
  const mode = isBound ? field.mode : "edit";
  const selected = value ? value.split(",") : [];
  if (mode === "values")
    return (
      <JsonFieldValue
        field={field}
        text={items
          .filter((item) => selected.includes(item.value))
          .map((item) => item.label)
          .join(", ")}
      />
    );
  const describedBy =
    [props.description ? descriptionId : undefined, field.controlProps["aria-describedby"]].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="space-y-2">
      <JsonFieldLabel field={field} id={labelId} />
      {props.description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {props.description}
        </p>
      )}
      <ToggleGroup
        multiple={type === "multiple"}
        disabled={mode === "locked"}
        value={selected}
        aria-labelledby={field.label ? labelId : undefined}
        aria-required={field.controlProps["aria-required"]}
        aria-invalid={field.controlProps["aria-invalid"]}
        aria-describedby={describedBy}
        onValueChange={(values) => {
          setValue(values.join(","));
          if (hasValidation) validate();
          emit("change");
        }}
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {selected.includes(item.value) && <CheckIcon aria-hidden="true" data-slot="toggle-group-item-check" />}
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <JsonFieldMessage field={field} />
    </div>
  );
};
