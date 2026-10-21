import type { ReactElement } from "react";
import { ContextDisplayRoot, type IPresetProps } from "./ContextDisplayRoot.js";
import { ContextDisplayTrigger } from "./ContextDisplayTrigger.js";
import { ContextDisplayContent } from "./ContextDisplayContent.js";
import { ContextDisplayValue } from "./ContextDisplayValue.js";

export function ContextDisplayBar({ side, ...props }: IPresetProps): ReactElement {
  return (
    <ContextDisplayRoot {...props}>
      <ContextDisplayTrigger aria-label="Context usage">
        <ContextDisplayValue variant="bar" />
      </ContextDisplayTrigger>
      <ContextDisplayContent side={side} />
    </ContextDisplayRoot>
  );
}
