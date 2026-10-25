import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonHeading = ({ props }: BaseComponentProps<JsonProps<"Heading">>) => {
  const level = props.level ?? "h2";
  const headingClass =
    level === "h1"
      ? "text-2xl font-bold"
      : level === "h3"
        ? "text-base font-semibold"
        : level === "h4"
          ? "text-sm font-semibold"
          : "text-lg font-semibold";

  if (level === "h1") return <h1 className={`${headingClass} text-left`}>{props.text}</h1>;
  if (level === "h3") return <h3 className={`${headingClass} text-left`}>{props.text}</h3>;
  if (level === "h4") return <h4 className={`${headingClass} text-left`}>{props.text}</h4>;
  return <h2 className={`${headingClass} text-left`}>{props.text}</h2>;
};
