import type { ComponentProps, ReactElement } from "react";
import { CommandEmpty } from "../../command/Command.js";
export function ModelSelectorEmpty({
  children = "No models found.",
  ...props
}: ComponentProps<typeof CommandEmpty>): ReactElement {
  return (
    <CommandEmpty data-slot="model-selector-empty" {...props}>
      {children}
    </CommandEmpty>
  );
}
