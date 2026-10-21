import { cn } from "../../../utils/cn.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import type { IComposerCommand } from "./composer/types.js";
import { ComposerMenuItem } from "./ComposerMenuItem.js";
export function ComposerCommandItem({ command, active, ...props }: IComposerCommandItemProps): JSX.Element {
  return (
    <ComposerMenuItem
      data-testid="ComposerCommandItem"
      active={active}
      shortcut={active ? "Enter" : undefined}
      {...props}
    >
      <command.icon aria-hidden="true" className={cn("size-4")} />
      <span className="font-medium">/{command.name}</span>
      <span className="text-muted-foreground flex-1 truncate text-start text-sm">{command.description}</span>
    </ComposerMenuItem>
  );
}
interface IComposerCommandItemProps extends Omit<ComponentProps<"button">, "children"> {
  command: IComposerCommand;
  active: boolean;
}
