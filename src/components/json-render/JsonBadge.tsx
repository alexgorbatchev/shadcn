import { type BaseComponentProps } from "@json-render/react";
import { Badge } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonBadge = ({ props }: BaseComponentProps<JsonProps<"Badge">>) => {
  // Wraps rather than being clipped when its cell is narrower than its text.
  return (
    <Badge variant={props.variant ?? "default"} wrap>
      {props.text}
    </Badge>
  );
};
