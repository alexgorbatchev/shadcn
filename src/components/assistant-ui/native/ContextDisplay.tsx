import type { ReactElement } from "react";
import { ContextDisplayRoot, type IContextDisplayRootProps } from "./ContextDisplayRoot.js";
import { ContextDisplayTrigger } from "../elements/ContextDisplayTrigger.js";
import { ContextDisplayContent } from "../elements/ContextDisplayContent.js";
import { ContextDisplayRing } from "./ContextDisplayRing.js";
import { ContextDisplayBar } from "./ContextDisplayBar.js";
import { ContextDisplayText } from "./ContextDisplayText.js";
export const ContextDisplay = Object.assign(
  function ContextDisplay(props: IContextDisplayRootProps): ReactElement {
    return <ContextDisplayRoot {...props} />;
  },
  {
    Root: ContextDisplayRoot,
    Trigger: ContextDisplayTrigger,
    Content: ContextDisplayContent,
    Ring: ContextDisplayRing,
    Bar: ContextDisplayBar,
    Text: ContextDisplayText,
  },
);
