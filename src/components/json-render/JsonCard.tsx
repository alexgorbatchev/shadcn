import { type BaseComponentProps } from "@json-render/react";
import { Card } from "../../index.js";
import { CardHeader } from "../../index.js";
import { CardTitle } from "../../index.js";
import { CardDescription } from "../../index.js";
import { CardContent } from "../../index.js";
import { cn } from "../../utils/cn.js";
import { type JsonProps } from "./catalog.js";
export const JsonCard = ({ props, children }: BaseComponentProps<JsonProps<"Card">>) => {
  const maxWidthClass =
    props.maxWidth === "sm"
      ? "max-w-xs sm:min-w-[280px]"
      : props.maxWidth === "md"
        ? "max-w-sm sm:min-w-[320px]"
        : props.maxWidth === "lg"
          ? "max-w-md sm:min-w-[360px]"
          : "w-full";
  const centeredClass = props.centered ? "mx-auto" : "";

  return (
    <Card className={cn(maxWidthClass, centeredClass, props.className)}>
      {(props.title || props.description) && (
        <CardHeader>
          {props.title && <CardTitle>{props.title}</CardTitle>}
          {props.description && <CardDescription>{props.description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
};
