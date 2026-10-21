import type { JSX } from "react";
import { type ComponentProps } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import type { IComposerModel } from "./composer/types.js";
import { ComposerMenuItem } from "./ComposerMenuItem.js";
export function ComposerModelItem({ entry, selected, ...props }: IComposerModelItemProps): JSX.Element {
  return (
    <ComposerMenuItem data-testid="ComposerModelItem" active={selected} {...props}>
      <span className="flex-1 text-start">{entry.name}</span>
      <span className={cn(mono, "text-muted-foreground tabular-nums")}>{entry.meta}</span>
      <span className="flex w-4 justify-end">
        {selected && <CheckIcon aria-hidden="true" className={cn("size-4")} />}
      </span>
    </ComposerMenuItem>
  );
}
interface IComposerModelItemProps extends Omit<ComponentProps<"button">, "children"> {
  entry: IComposerModel;
  selected: boolean;
}
