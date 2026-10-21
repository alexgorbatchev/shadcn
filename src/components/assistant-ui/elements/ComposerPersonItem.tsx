import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import type { IComposerPerson } from "./composer/types.js";
import { ComposerMenuItem } from "./ComposerMenuItem.js";
export function ComposerPersonItem({ person, active, ...props }: IComposerPersonItemProps): JSX.Element {
  return (
    <ComposerMenuItem data-testid="ComposerPersonItem" active={active} {...props}>
      <span
        aria-hidden="true"
        className="bg-foreground/[0.06] text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
      >
        {person.name[0]}
      </span>
      <span className="flex-1 truncate text-start">{person.name}</span>
      <span className={cn(mono, "text-muted-foreground")}>{person.role}</span>
    </ComposerMenuItem>
  );
}
interface IComposerPersonItemProps extends Omit<ComponentProps<"button">, "children"> {
  person: IComposerPerson;
  active: boolean;
}
