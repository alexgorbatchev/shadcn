import type { ReactElement } from "react";
import type { IPresetProps } from "../elements/ContextDisplayRoot.js";
import { ContextDisplayRoot } from "./ContextDisplayRoot.js";
import { ContextDisplayTrigger } from "../elements/ContextDisplayTrigger.js";
import { ContextDisplayContent } from "../elements/ContextDisplayContent.js";
import { ContextDisplayValue } from "../elements/ContextDisplayValue.js";
export function ContextDisplayText({ side, ...props }: Omit<IPresetProps, "resetKey">): ReactElement {
  return (
    <ContextDisplayRoot {...props}>
      <ContextDisplayTrigger aria-label="Context usage">
        <ContextDisplayValue variant="text" />
      </ContextDisplayTrigger>
      <ContextDisplayContent side={side} />
    </ContextDisplayRoot>
  );
}
