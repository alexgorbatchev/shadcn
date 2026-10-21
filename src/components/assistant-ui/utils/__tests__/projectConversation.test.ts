import { expect, test } from "vitest";
import { fromThreadMessageLike, type ThreadMessage, type ThreadMessageLike } from "@assistant-ui/react";
import { projectConversation } from "../projectConversation.js";

function message(input: ThreadMessageLike): ThreadMessage {
  return fromThreadMessageLike(input, "fallback", { type: "complete", reason: "stop" });
}

test("groups answers under their question and ignores system messages", () => {
  const projection = projectConversation(
    [
      message({ id: "system", role: "system", content: "Instructions" }),
      message({ id: "q1", role: "user", content: "## First question\nDetails" }),
      message({ id: "a1", role: "assistant", content: "First answer" }),
      message({ id: "a2", role: "assistant", content: "Further answer" }),
      message({ id: "q2", role: "user", content: "Second question\nMore details" }),
    ],
    undefined,
  );
  expect(projection.entries).toEqual([
    { id: "q1", title: "First question", preview: "First answer" },
    { id: "q2", title: "Second question", preview: "More details" },
  ]);
  expect(projection.turnOf.get("a2")).toBe("q1");
  expect(projection.turnOf.has("system")).toBe(false);
});

test("updates streaming previews without mutating the previous projection", () => {
  const question = message({ id: "question", role: "user", content: "Review the code" });
  const answer = message({ id: "answer", role: "assistant", content: "Reviewing" });
  const initial = projectConversation([question, answer], undefined);
  const updated = projectConversation(
    [question, message({ id: "answer", role: "assistant", content: "Review complete" })],
    initial,
  );
  expect(initial.entries[0]?.preview).toBe("Reviewing");
  expect(updated.entries[0]?.preview).toBe("Review complete");
  expect(updated.turnOf).toBe(initial.turnOf);
  const continued = projectConversation(
    [...updated.messages, message({ id: "followup", role: "assistant", content: "Additional findings" })],
    updated,
  );
  expect(continued.turnOf.get("followup")).toBe("question");
  expect(updated.turnOf.has("followup")).toBe(false);
  expect(updated.turns[0]?.members).toHaveLength(2);
});

test("keeps an initial assistant turn and removes obsolete turns after rewind", () => {
  const greeting = message({ id: "greeting", role: "assistant", content: "Welcome" });
  const question = message({ id: "question", role: "user", content: "Help me" });
  const initial = projectConversation([greeting, question], undefined);
  expect(initial.entries).toHaveLength(2);
  const rewound = projectConversation([greeting], initial);
  expect(rewound.entries).toEqual([{ id: "greeting", title: "Welcome" }]);
  expect(rewound.turnOf.has("question")).toBe(false);
});

test("labels attachment-only messages and tool-only responses", () => {
  const image = message({
    id: "image",
    role: "user",
    content: [],
    attachments: [{ id: "file", name: "diagram.png", type: "image", status: { type: "complete" }, content: [] }],
  });
  const tool = message({
    id: "tool",
    role: "assistant",
    content: [{ type: "tool-call", toolName: "inspect_project", args: {}, argsText: "{}" }],
  });
  expect(projectConversation([image], undefined).entries).toEqual([{ id: "image", title: "Image" }]);
  expect(projectConversation([tool], undefined).entries).toEqual([{ id: "tool", title: "inspect_project" }]);
});

test("labels reasoning, files, images and empty turns without inventing text", () => {
  const inputs: ThreadMessageLike[] = [
    { id: "reasoning", role: "assistant", content: [{ type: "reasoning", text: "Inspecting" }] },
    { id: "file", role: "user", content: [{ type: "file", data: "Notes", mimeType: "text/plain" }] },
    { id: "image", role: "user", content: [{ type: "image", image: "https://example.com/image.png" }] },
    {
      id: "attachment",
      role: "user",
      content: [],
      attachments: [{ id: "f", name: "notes.txt", type: "file", status: { type: "complete" }, content: [] }],
    },
    { id: "empty-question", role: "user", content: [] },
    { id: "empty-answer", role: "assistant", content: [] },
    {
      id: "tools",
      role: "assistant",
      content: [
        { type: "tool-call", toolName: "read", args: {}, argsText: "{}" },
        { type: "tool-call", toolName: "check", args: {}, argsText: "{}" },
      ],
    },
  ];
  expect(inputs.map((input) => projectConversation([message(input)], undefined).entries[0]?.title)).toEqual([
    "Reasoning",
    "File",
    "Image",
    "File",
    "Message",
    "Response",
    "2 tool calls",
  ]);
});

test("truncates long titles at a word boundary and preserves the remaining preview", () => {
  const words = Array.from({ length: 20 }, () => "review").join(" ");
  const entry = projectConversation([message({ id: "long", role: "user", content: words })], undefined).entries[0];
  expect(entry).toEqual({
    id: "long",
    title: Array.from({ length: 10 }, () => "review").join(" "),
    preview: Array.from({ length: 10 }, () => "review").join(" "),
  });
  expect(
    projectConversation([message({ id: "unbroken", role: "user", content: "a".repeat(80) })], undefined).entries,
  ).toEqual([{ id: "unbroken", title: "a".repeat(72), preview: "a".repeat(8) }]);
});

test("reuses unchanged projections and rebuilds message membership after branch replacement", () => {
  const question = message({ id: "question", role: "user", content: "Review" });
  const answer = message({ id: "answer", role: "assistant", content: "Done" });
  const initial = projectConversation([question, answer], undefined);
  const unchanged = projectConversation([question, answer], initial);
  expect(unchanged.turnOf).toBe(initial.turnOf);
  expect(unchanged.entries).toBe(initial.entries);
  const changed = projectConversation(
    [question, message({ id: "replacement", role: "assistant", content: "Updated" })],
    initial,
  );
  expect(changed.turnOf.get("replacement")).toBe("question");
  expect(changed.turnOf.has("answer")).toBe(false);
  const extended = projectConversation(
    [
      ...changed.messages,
      message({ id: "system", role: "system", content: "Policy" }),
      message({ id: "second", role: "user", content: "Next" }),
    ],
    changed,
  );
  expect(extended.entries).toEqual([
    { id: "question", title: "Review", preview: "Updated" },
    { id: "second", title: "Next" },
  ]);
});
