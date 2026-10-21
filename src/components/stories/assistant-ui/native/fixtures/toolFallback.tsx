import type { ReactElement, ComponentProps } from "react";
import {
  ToolFallback,
  ToolFallbackRoot,
  ToolFallbackTrigger,
  ToolFallbackContent,
  ToolFallbackArgs,
  ToolFallbackError,
  ToolFallbackResult,
} from "../../../../assistant-ui/native/ToolFallbackRoot.js";
import { MessageMetadataFixture } from "./metadata.js";

interface IToolFallbackFixtureProps {
  status?: ComponentProps<typeof ToolFallback>["status"];
  result?: unknown;
  argsText?: string;
  durationMs?: number;
  responseDeliveryStatus?: "queued";
}

export function ToolFallbackFixture({
  status,
  result,
  argsText,
  durationMs,
  responseDeliveryStatus,
}: IToolFallbackFixtureProps): ReactElement {
  return (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: [
            {
              type: "tool-call",
              toolCallId: "inspection",
              toolName: "inspect",
              args: {},
              argsText: "{}",
              result: "Done",
              timing: durationMs === undefined ? undefined : { startedAt: 1000, completedAt: 1000 + durationMs },
            },
          ],
        },
      ]}
      components={{
        tools: {
          Fallback: () => (
            <ToolFallbackRoot defaultOpen>
              <ToolFallbackTrigger toolName="inspect" status={status} responseDeliveryStatus={responseDeliveryStatus} />
              <ToolFallbackContent>
                <ToolFallbackArgs argsText={argsText} />
                <ToolFallbackError status={status} />
                <ToolFallbackResult result={result} />
              </ToolFallbackContent>
            </ToolFallbackRoot>
          ),
        },
      }}
    />
  );
}
