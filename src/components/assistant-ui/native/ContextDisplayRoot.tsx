import type { ReactElement, ReactNode } from "react";
import { ContextDisplayRoot as ContextDisplayBase } from "../elements/ContextDisplayRoot.js";
import type { TokenUsage } from "../utils/contextUsage.js";
import { ContextDisplayRuntimeRoot } from "./ContextDisplayRuntimeRoot.js";
export interface IContextDisplayRootProps {
  modelContextWindow: number;
  children: ReactNode;
  usage?: TokenUsage | undefined;
}
export function ContextDisplayRoot({ usage, ...props }: IContextDisplayRootProps): ReactElement {
  return usage !== undefined ? (
    <ContextDisplayBase {...props} usage={usage} />
  ) : (
    <ContextDisplayRuntimeRoot {...props} />
  );
}
