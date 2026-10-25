import { type BaseComponentProps } from "@json-render/react";
import { Label } from "../../index.js";
import { Progress } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonProgress = ({ props }: BaseComponentProps<JsonProps<"Progress">>) => {
  const value = Math.min(100, Math.max(0, props.value || 0));
  return (
    <div className="space-y-2">
      {props.label && <Label className="text-sm text-muted-foreground">{props.label}</Label>}
      <Progress value={value} />
    </div>
  );
};
