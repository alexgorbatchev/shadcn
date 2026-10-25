import { type BaseComponentProps } from "@json-render/react";
import { Alert } from "../../index.js";
import { AlertTitle } from "../../index.js";
import { AlertDescription } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonAlert = ({ props }: BaseComponentProps<JsonProps<"Alert">>) => {
  return (
    <Alert variant={props.type === "error" ? "destructive" : (props.type ?? "default")}>
      <AlertTitle>{props.title}</AlertTitle>
      {props.message && <AlertDescription>{props.message}</AlertDescription>}
    </Alert>
  );
};
