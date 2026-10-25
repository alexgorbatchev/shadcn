import { Spinner } from "../../index.js";
import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonSpinner = ({ props }: BaseComponentProps<JsonProps<"Spinner">>) => {
  return (
    <Spinner
      aria-label={props.label ?? "Loading"}
      className={props.size === "lg" ? "size-8" : props.size === "sm" ? "size-4" : "size-6"}
    />
  );
};
