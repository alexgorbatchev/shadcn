import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Toggle } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonFieldValue, useJsonField } from "./JsonForm.js";
export const JsonToggle = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Toggle">>) => {
  const [boundPressed, setBoundPressed] = useBoundProp<boolean>(props.pressed ?? undefined, bindings?.pressed);
  const [localPressed, setLocalPressed] = useState(props.pressed ?? false);
  const isBound = !!bindings?.pressed;
  const pressed = isBound ? (boundPressed ?? false) : localPressed;
  const setPressed = isBound ? setBoundPressed : setLocalPressed;
  const field = useJsonField({ path: bindings?.pressed, label: props.label });
  // Only a bound toggle is an answer; an unbound one switches a view and keeps working in every mode.
  const mode = isBound ? field.mode : "edit";
  if (mode === "values") return <JsonFieldValue field={field} text={pressed ? "On" : "Off"} />;

  return (
    <Toggle
      variant={props.variant ?? "default"}
      pressed={pressed}
      disabled={mode === "locked"}
      onPressedChange={(v) => {
        setPressed(v);
        emit("change");
      }}
    >
      {props.label}
    </Toggle>
  );
};
