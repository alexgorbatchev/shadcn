import type { ThreadMessage } from "@assistant-ui/react";
import type { IConversationMapEntry } from "../elements/ConversationMap.js";
export type MessageSummary = {
  hasText: boolean;
  title: string;
  answerPreview: string;
  questionPreview: string;
};
export type Turn = {
  head: ThreadMessage;
  members: ThreadMessage[];
  endIndex: number;
};
export type ConversationProjection = {
  messages: readonly ThreadMessage[];
  turns: readonly Turn[];
  entries: readonly IConversationMapEntry[];
  turnOf: ReadonlyMap<string, string>;
  turnKey: string;
};
