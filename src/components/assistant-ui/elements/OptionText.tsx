import type { JSX } from "react";
import type { IOptionListOption } from "./types.js";
import { cn } from "../../../utils/cn.js";

interface IOptionTextProps {
  option: IOptionListOption;
  isPadded?: boolean;
}

export function OptionText({ option, isPadded = false }: IOptionTextProps): JSX.Element {
  return (
    <span data-testid="OptionText" className={cn("flex min-w-0 flex-1 flex-col gap-0.5", isPadded && "p-2")}>
      <span className="text-lg break-words">{option.label}</span>
      {option.description ? (
        <span className="text-base text-muted-foreground break-words">{option.description}</span>
      ) : null}
    </span>
  );
}
