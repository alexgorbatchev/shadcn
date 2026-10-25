import { type BaseComponentProps } from "@json-render/react";
import { Avatar as AvatarPrimitive } from "../../index.js";
import { AvatarImage } from "../../index.js";
import { AvatarFallback } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonAvatar = ({ props }: BaseComponentProps<JsonProps<"Avatar">>) => {
  const name = props.name || "?";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = props.size === "lg" ? "h-12 w-12" : props.size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <AvatarPrimitive className={sizeClass}>
      {props.src && <AvatarImage src={props.src} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </AvatarPrimitive>
  );
};
