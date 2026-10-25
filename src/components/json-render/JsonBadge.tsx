import { type BaseComponentProps } from "@json-render/react";
import { Badge } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonBadge = ({ props }: BaseComponentProps<JsonProps<"Badge">>) => {
  return <Badge variant={props.variant ?? "default"}>{props.text}</Badge>;
};
