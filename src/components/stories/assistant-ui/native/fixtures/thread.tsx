import type { PropsWithChildren, ReactElement } from "react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import type { ThreadGroupPart } from "../../../../assistant-ui/native/Thread.js";

const image = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="navy"/></svg>')}`;

export const fixture_voiceExchange: readonly ThreadMessageLike[] = [
  { role: "user", content: "Start the spoken review.", metadata: { modality: "voice" } },
  { role: "assistant", content: "I can inspect the service.", metadata: { modality: "voice" } },
  { role: "user", content: "Check its health.", metadata: { modality: "voice" } },
  { role: "assistant", content: "The service is healthy.", metadata: { modality: "voice" } },
  { role: "user", content: "Continue in text." },
  { role: "assistant", content: "Spoken summary complete.", metadata: { modality: "voice" } },
];

export const fixture_inlineMedia: readonly ThreadMessageLike[] = [
  {
    role: "user",
    content: [
      { type: "text", text: "Review these inline files." },
      { type: "file", data: "User notes", mimeType: "text/plain", filename: "user-notes.txt" },
      { type: "file", data: image, sourceType: "url", mimeType: "image/svg+xml", filename: "user-file.svg" },
      { type: "image", image, filename: "user-image.svg" },
    ],
  },
  {
    role: "assistant",
    content: [
      { type: "text", text: "The inline files are ready." },
      { type: "file", data: "Assistant notes", mimeType: "text/plain", filename: "assistant-notes.txt" },
      { type: "file", data: image, sourceType: "url", mimeType: "image/svg+xml", filename: "assistant-file.svg" },
      { type: "image", image, filename: "assistant-image.svg" },
    ],
  },
];

interface IThreadGroupFixtureProps {
  group: ThreadGroupPart;
}

export const fixture_groupedMessage: readonly ThreadMessageLike[] = [
  {
    role: "assistant",
    content: [
      { type: "reasoning", text: "Review native service metadata." },
      {
        type: "tool-call",
        toolCallId: "service-scan",
        toolName: "inspect_service",
        args: { service: "docs" },
        argsText: '{"service":"docs"}',
        result: { healthy: true },
      },
    ],
  },
];

export function ThreadReasoningFixture({ children, group }: PropsWithChildren<IThreadGroupFixtureProps>): ReactElement {
  return (
    <details>
      <summary>Review reasoning ({group.indices.length})</summary>
      {children}
    </details>
  );
}

export function ThreadToolsFixture({ children, group }: PropsWithChildren<IThreadGroupFixtureProps>): ReactElement {
  return (
    <details>
      <summary>Review tools ({group.indices.length})</summary>
      {children}
    </details>
  );
}
