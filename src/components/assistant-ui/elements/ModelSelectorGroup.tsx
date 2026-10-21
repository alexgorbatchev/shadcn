import type { ComponentProps, ReactElement } from "react";
import { CommandGroup } from "../../command/Command.js";
export function ModelSelectorGroup(props: ComponentProps<typeof CommandGroup>): ReactElement {
  return <CommandGroup data-slot="model-selector-group" {...props} />;
}
