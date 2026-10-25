import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Toggle } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonToggle = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Toggle">>) => {
  const [boundPressed, setBoundPressed] = useBoundProp<boolean>(props.pressed ?? undefined, bindings?.pressed);
  const [localPressed, setLocalPressed] = useState(props.pressed ?? false);
  const isBound = !!bindings?.pressed;
  const pressed = isBound ? (boundPressed ?? false) : localPressed;
  const setPressed = isBound ? setBoundPressed : setLocalPressed;

  return (
    <Toggle
      variant={props.variant ?? "default"}
      pressed={pressed}
      onPressedChange={(v) => {
        setPressed(v);
        emit("change");
      }}
    >
      {props.label}
    </Toggle>
  );
};
