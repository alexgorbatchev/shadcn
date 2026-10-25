import { type BaseComponentProps } from "@json-render/react";
import { Button } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonButton = ({ props, emit }: BaseComponentProps<JsonProps<"Button">>) => {
  const variant = props.variant === "danger" ? "destructive" : props.variant === "secondary" ? "secondary" : "default";

  return (
    <Button variant={variant} disabled={props.disabled ?? false} onClick={() => emit("press")}>
      {props.label}
    </Button>
  );
};
