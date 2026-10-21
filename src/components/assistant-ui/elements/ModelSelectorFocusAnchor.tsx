import type { ReactElement } from "react";
import { CommandInput } from "../../command/Command.js";
export function ModelSelectorFocusAnchor(): ReactElement {
  return (
    <div className="sr-only">
      <CommandInput readOnly aria-label="Model" />
    </div>
  );
}
