import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonImage = ({ props }: BaseComponentProps<JsonProps<"Image">>) => {
  if (props.src) {
    return (
      <img
        src={props.src}
        alt={props.alt ?? ""}
        width={props.width ?? undefined}
        height={props.height ?? undefined}
        className="rounded max-w-full"
      />
    );
  }
  return (
    <div
      className="bg-muted border border-border rounded flex items-center justify-center text-xs text-muted-foreground"
      style={{ width: props.width ?? 80, height: props.height ?? 60 }}
    >
      {props.alt || "img"}
    </div>
  );
};
