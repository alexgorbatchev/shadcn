import { useState, type ReactElement } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  SimpleImageAttachmentAdapter,
  ThreadPrimitive,
  useLocalRuntime,
  type AttachmentAdapter,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { Button } from "../../../../Button.js";
import { PortalProvider } from "../../../../PortalProvider.js";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "../../../../assistant-ui/native/AttachmentPreview.js";
import { fixture_chatModelAdapter } from "../fixtures.js";
import { NativeRuntimeFixture } from "../helpers.js";

const image =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="navy"/></svg>';
const imageUrl = `data:image/svg+xml,${encodeURIComponent(image)}`;
const imageAdapter = new SimpleImageAttachmentAdapter();
const errorAdapter: AttachmentAdapter = {
  accept: imageAdapter.accept,
  add: async (input) => ({
    ...(await imageAdapter.add(input)),
    status: { type: "incomplete", reason: "error", message: "The image could not be attached." },
  }),
  remove: imageAdapter.remove.bind(imageAdapter),
  send: imageAdapter.send.bind(imageAdapter),
};
const fixture_imageMessages: readonly ThreadMessageLike[] = [
  {
    role: "user",
    content: "Review the diagram",
    attachments: [
      {
        id: "diagram",
        type: "image",
        name: "diagram.svg",
        contentType: "image/svg+xml",
        status: { type: "complete" },
        content: [{ type: "image", image: imageUrl }],
      },
    ],
  },
];
const fixture_documentMessages: readonly ThreadMessageLike[] = [
  {
    role: "user",
    content: "Review the guide",
    attachments: [
      {
        id: "guide",
        type: "document",
        name: "guide.txt",
        contentType: "text/plain",
        status: { type: "complete" },
        content: [{ type: "text", text: "Project guide" }],
      },
    ],
  },
];

interface IMessageAttachmentFixtureProps {
  isImage?: boolean;
}
interface IComposerAttachmentFixtureProps {
  hasError?: boolean;
}

function AttachmentMessage(): ReactElement {
  return (
    <MessagePrimitive.Root>
      <UserMessageAttachments />
    </MessagePrimitive.Root>
  );
}

export function MessageAttachmentFixture({ isImage = true }: IMessageAttachmentFixtureProps): ReactElement {
  return (
    <NativeRuntimeFixture initialMessages={isImage ? fixture_imageMessages : fixture_documentMessages}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Messages
          components={{ UserMessage: AttachmentMessage, AssistantMessage: AttachmentMessage }}
        />
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}

export function ComposerAttachmentFixture({ hasError = false }: IComposerAttachmentFixtureProps): ReactElement {
  const runtime = useLocalRuntime(fixture_chatModelAdapter, {
    adapters: { attachments: hasError ? errorAdapter : imageAdapter },
  });
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer}>
      {container ? (
        <AssistantRuntimeProvider runtime={runtime}>
          <PortalProvider container={container}>
            <Button
              onClick={() =>
                runtime.thread.composer.addAttachment(new File([image], "diagram.svg", { type: "image/svg+xml" }))
              }
            >
              Attach diagram
            </Button>
            <ComposerPrimitive.Root>
              <ComposerAddAttachment />
              <ComposerAttachments />
            </ComposerPrimitive.Root>
          </PortalProvider>
        </AssistantRuntimeProvider>
      ) : null}
    </div>
  );
}
