import { type BaseComponentProps } from "@json-render/react";
import { Separator } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonSeparator = ({ props }: BaseComponentProps<JsonProps<"Separator">>) => {
  return (
    <Separator
      orientation={props.orientation ?? "horizontal"}
      className={props.orientation === "vertical" ? "h-full mx-2" : "my-3"}
    />
  );
};
