import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { fromThreadMessageLike, type ThreadMessage } from "@assistant-ui/react";
import { useConversationProjection } from "../useConversationProjection.js";

afterEach(cleanup);

test("retains unchanged projections and updates streamed message text", () => {
  const question = fromThreadMessageLike({ id: "question", role: "user", content: "Review this page" }, "question", {
    type: "complete",
    reason: "stop",
  });
  const answer = fromThreadMessageLike({ id: "answer", role: "assistant", content: "Reading" }, "answer", {
    type: "running",
  });
  const messages: readonly ThreadMessage[] = [question, answer];
  const hook = renderHook((input: readonly ThreadMessage[]) => useConversationProjection(input), {
    initialProps: messages,
  });
  const before = hook.result.current;
  hook.rerender(messages);
  expect(hook.result.current).toBe(before);
  hook.rerender([
    question,
    fromThreadMessageLike({ id: "answer", role: "assistant", content: "Review complete" }, "answer", {
      type: "complete",
      reason: "stop",
    }),
  ]);
  expect(hook.result.current.entries[0]?.preview).toBe("Review complete");
  expect(before.entries[0]?.preview).toBe("Reading");
  expect(hook.result.current.turnOf).toBe(before.turnOf);
});
