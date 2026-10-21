import type { ComponentProps, ReactElement } from "react";
import { CommandSeparator } from "../../command/Command.js";
export function ModelSelectorSeparator(props: ComponentProps<typeof CommandSeparator>): ReactElement {
  return <CommandSeparator data-slot="model-selector-separator" {...props} />;
}
