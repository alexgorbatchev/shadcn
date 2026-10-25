import { type BaseComponentProps } from "@json-render/react";
import { cn } from "../../utils/cn.js";
import { type JsonProps } from "./catalog.js";
export const JsonGrid = ({ props, children }: BaseComponentProps<JsonProps<"Grid">>) => {
  const colsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };
  const gridGapMap: Record<string, string> = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };

  const n = Math.max(1, Math.min(6, props.columns ?? 1));
  const cols = colsMap[n] ?? "grid-cols-1";
  const gridGap = gridGapMap[props.gap ?? "md"] ?? "gap-3";

  return <div className={cn("grid", cols, gridGap, props.className)}>{children}</div>;
};
