import type { ReactElement } from "react";
import { useAuiState } from "@assistant-ui/react";
import { useThreadTokenUsage } from "@assistant-ui/ai-sdk";
import { ContextDisplayRoot } from "../elements/ContextDisplayRoot.js";
import type { IContextDisplayRootProps } from "./ContextDisplayRoot.js";
export function ContextDisplayRuntimeRoot(props: Omit<IContextDisplayRootProps, "usage">): ReactElement {
  const usage = useThreadTokenUsage();
  const threadId = useAuiState((state) => state.threadListItem.id);
  return <ContextDisplayRoot {...props} usage={usage} resetKey={threadId} />;
}
