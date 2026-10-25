import { ButtonLink } from "../../index.js";
import { type BaseComponentProps } from "@json-render/react";
import { type JsonProps } from "./catalog.js";
export const JsonLink = ({ props, on }: BaseComponentProps<JsonProps<"Link">>) => {
  return (
    <ButtonLink
      variant="link"
      size="inline"
      href={props.href ?? "#"}
      onClick={(e) => {
        const press = on("press");
        if (press.shouldPreventDefault) e.preventDefault();
        press.emit();
      }}
    >
      {props.label}
    </ButtonLink>
  );
};
