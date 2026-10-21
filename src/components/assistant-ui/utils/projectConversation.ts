import type { ThreadMessage } from "@assistant-ui/react";
import type { IConversationMapEntry } from "../elements/ConversationMap.js";
import type { ConversationProjection, MessageSummary, Turn } from "../conversationMap/types.js";
const TITLE_LENGTH = 72;
const PREVIEW_LENGTH = 240;
const cutAtWord = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const boundary = head.lastIndexOf(" ");
  return boundary > limit / 2 ? head.slice(0, boundary) : head;
};
const summarizeMessage = (message: ThreadMessage): MessageSummary => {
  const content = message.content;
  const textParts: string[] = [];
  const tools: string[] = [];
  let hasReasoning = false;
  let hasImage = false;
  let hasFile = false;
  for (const part of content) {
    switch (part.type) {
      case "text":
        textParts.push(part.text);
        break;
      case "tool-call":
        tools.push(part.toolName);
        break;
      case "reasoning":
        hasReasoning = true;
        break;
      case "image":
        hasImage = true;
        break;
      case "file":
        hasFile = true;
        break;
    }
  }
  // A composer submission carries its files in `attachments` and leaves
  // `content` empty, so both places decide an attachment-only turn's label.
  const attachments = message.attachments ?? [];
  for (const attachment of attachments) {
    if (attachment.type === "image") hasImage = true;
    if (attachment.type === "file") hasFile = true;
  }
  const text = textParts.join("\n").trim();
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^[\s#>*`-]+/, "").trim())
    .filter(Boolean);
  let label: string;
  const onlyTool = tools[0];
  if (tools.length === 1 && onlyTool !== undefined) label = onlyTool;
  else if (tools.length > 1) label = `${tools.length} tool calls`;
  else if (hasReasoning) label = "Reasoning";
  else if (hasImage) label = "Image";
  else if (hasFile) label = "File";
  else if (content.length + attachments.length > 0) label = "Attachment";
  else label = message.role === "user" ? "Message" : "Response";
  const first = lines[0] ?? "";
  const title = cutAtWord(first, TITLE_LENGTH);
  return {
    hasText: text.length > 0,
    title: title || label,
    answerPreview: lines.join(" ").trim().slice(0, PREVIEW_LENGTH),
    questionPreview: [first.slice(title.length), ...lines.slice(1)].join(" ").trim().slice(0, PREVIEW_LENGTH),
  };
};
const hasSameStructure = (previous: ConversationProjection, turns: readonly Turn[], reusableTurns: number) => {
  if (previous.turns.length !== turns.length) return false;
  for (let index = reusableTurns; index < turns.length; index++) {
    const before = previous.turns[index];
    const after = turns[index];
    if (!before || !after) return false;
    if (before.head.id !== after.head.id) return false;
    if (before.members.length !== after.members.length) return false;
    for (let memberIndex = 0; memberIndex < after.members.length; memberIndex++) {
      if (before.members[memberIndex]?.id !== after.members[memberIndex]?.id) {
        return false;
      }
    }
  }
  return true;
};
export const projectConversation = (
  messages: readonly ThreadMessage[],
  previous: ConversationProjection | undefined,
): ConversationProjection => {
  let firstChanged = 0;
  if (previous) {
    const sharedLength = Math.min(previous.messages.length, messages.length);
    while (firstChanged < sharedLength && previous.messages[firstChanged] === messages[firstChanged]) {
      firstChanged++;
    }
    if (firstChanged === messages.length && messages.length === previous.messages.length) {
      return { ...previous, messages };
    }
  }
  let reusableTurns = 0;
  if (previous) {
    while (reusableTurns < previous.turns.length) {
      const turn = previous.turns[reusableTurns];
      if (!turn || turn.endIndex >= firstChanged) break;
      reusableTurns++;
    }
    const boundary = (previous.turns[reusableTurns - 1]?.endIndex ?? -1) + 1;
    for (let index = boundary; index < messages.length; index++) {
      const role = messages[index]?.role;
      if (role !== "user" && role !== "assistant") continue;
      if (role === "assistant" && reusableTurns > 0) reusableTurns--;
      break;
    }
  }
  const startIndex = (previous?.turns[reusableTurns - 1]?.endIndex ?? -1) + 1;
  const turns = previous ? previous.turns.slice(0, reusableTurns) : [];
  for (let index = startIndex; index < messages.length; index++) {
    const message = messages[index];
    if (!message || (message.role !== "user" && message.role !== "assistant")) continue;
    const current = turns.at(-1);
    if (message.role === "user" || !current) {
      turns.push({ head: message, members: [message], endIndex: index });
    } else {
      current.members.push(message);
      current.endIndex = index;
    }
  }
  const entries = previous ? previous.entries.slice(0, reusableTurns) : [];
  for (let index = reusableTurns; index < turns.length; index++) {
    const turn = turns[index];
    if (turn) entries.push(describe(turn));
  }
  if (previous && hasSameStructure(previous, turns, reusableTurns)) {
    return {
      messages,
      turns,
      entries,
      turnOf: previous.turnOf,
      turnKey: previous.turnKey,
    };
  }
  const turnOf = new Map<string, string>();
  for (const turn of turns) {
    for (const member of turn.members) turnOf.set(member.id, turn.head.id);
  }
  return {
    messages,
    turns,
    entries,
    turnOf,
    turnKey: turns.map((turn) => turn.head.id).join(" "),
  };
};
const describe = ({ head, members }: Turn): IConversationMapEntry => {
  const headSummary = summarizeMessage(head);
  // What the turn asked names it; what it answered is the useful preview, and
  // a turn still being answered falls back to the rest of its own text.
  const answer = members.find((member) => member !== head && summarizeMessage(member).hasText);
  const preview = answer ? summarizeMessage(answer).answerPreview : headSummary.questionPreview;
  return {
    id: head.id,
    title: headSummary.title,
    ...(preview ? { preview } : {}),
  };
};
