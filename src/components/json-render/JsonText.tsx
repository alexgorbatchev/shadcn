import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonText = ({ props }: BaseComponentProps<JsonProps<"Text">>) => {
  const textClass =
    props.variant === "caption"
      ? "text-xs"
      : props.variant === "muted"
        ? "text-sm leading-(--ag-leading) text-muted-foreground"
        : props.variant === "lead"
          ? "text-xl leading-(--ag-leading) text-muted-foreground"
          : props.variant === "code"
            ? "font-mono text-sm bg-muted px-1.5 py-0.5 rounded"
            : "text-sm leading-(--ag-leading)";

  if (props.variant === "code") {
    return <code className={`${textClass} text-left`}>{props.text}</code>;
  }
  return <p className={`${textClass} text-left`}>{props.text}</p>;
};
