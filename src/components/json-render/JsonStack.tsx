import { type BaseComponentProps } from "@json-render/react";
import { cn } from "../../utils/cn.js";
import { type JsonProps } from "./catalog.js";
export const JsonStack = ({ props, children }: BaseComponentProps<JsonProps<"Stack">>) => {
  const isHorizontal = props.direction === "horizontal";
  const gapMap: Record<string, string> = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };
  const alignMap: Record<string, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };
  const justifyMap: Record<string, string> = {
    start: "",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  const gapClass = gapMap[props.gap ?? "md"] ?? "gap-3";
  const alignClass = alignMap[props.align ?? "start"] ?? "items-start";
  const justifyClass = justifyMap[props.justify ?? ""] ?? "";

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-row flex-wrap" : "flex-col",
        gapClass,
        alignClass,
        justifyClass,
        props.className,
      )}
    >
      {children}
    </div>
  );
};
