import { type JSX, type PropsWithChildren } from "react";
import { render, renderHook, type RenderResult, type RenderHookResult } from "@testing-library/react";
import {
  AssistantRuntimeProvider,
  MessageByIndexProvider,
  MessageAttachmentByIndexProvider,
  useAuiState,
  useLocalRuntime,
  type ChatModelAdapter,
  type CompleteAttachment,
} from "@assistant-ui/react";
import { useAttachmentSrc } from "../../useAttachmentSrc.js";
import { ModalSizeHarness } from "./components/ModalSizeHarness.js";
const fixture_adapter: ChatModelAdapter = {
  async run() {
    return { content: [{ type: "text", text: "Ready" }] };
  },
};
function AttachmentScope({ children }: PropsWithChildren): JSX.Element | null {
  const hasMessage = useAuiState((state) => state.thread.messages.length > 0);
  return hasMessage ? (
    <MessageByIndexProvider index={0}>
      <MessageAttachmentByIndexProvider index={0}>{children}</MessageAttachmentByIndexProvider>
    </MessageByIndexProvider>
  ) : null;
}
export function factory_attachmentHook(attachment: CompleteAttachment): RenderHookResult<string | undefined, void> {
  function AttachmentWrapper({ children }: PropsWithChildren): JSX.Element {
    const runtime = useLocalRuntime(fixture_adapter, {
      initialMessages: [
        { role: "user", content: [{ type: "text", text: "Inspect attachment" }], attachments: [attachment] },
      ],
    });
    return (
      <AssistantRuntimeProvider runtime={runtime}>
        <AttachmentScope>{children}</AttachmentScope>
      </AssistantRuntimeProvider>
    );
  }
  return renderHook(useAttachmentSrc, { wrapper: AttachmentWrapper });
}
export function factory_modalSizeHarness(): RenderResult {
  return render(<ModalSizeHarness />);
}
