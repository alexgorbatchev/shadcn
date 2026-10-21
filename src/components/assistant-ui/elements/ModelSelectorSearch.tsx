import type { ComponentProps, ReactElement } from "react";
import { CommandInput } from "../../command/Command.js";
export function ModelSelectorSearch({
  placeholder = "Search models...",
  ...props
}: ComponentProps<typeof CommandInput>): ReactElement {
  return (
    <CommandInput data-slot="model-selector-search" aria-label="Search models" placeholder={placeholder} {...props} />
  );
}
