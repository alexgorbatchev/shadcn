import { describe, expect, test } from "vitest";
import { readOutcome } from "../askQuestion.js";
describe("ask question result decoding", () => {
  test("distinguishes unanswered, answered and skipped results", () => {
    expect(readOutcome(undefined, false)).toBeUndefined();
    expect(readOutcome({ status: "answered", answer: "Staging" }, false)).toEqual({ answer: "Staging" });
    expect(readOutcome({ interrupted: true }, false)).toEqual({ note: "Skipped" });
    expect(readOutcome({ status: "unavailable" }, false)).toEqual({ note: "Unavailable in this session" });
  });
  test("interprets errors only for failed executions and retains unknown payloads", () => {
    expect(readOutcome({ error: "Failure" }, true)).toEqual({ note: "Error: Failure" });
    expect(readOutcome({ error: "Failure" }, false)).toEqual({ raw: { error: "Failure" } });
    expect(readOutcome(null, true)).toEqual({ raw: null });
    expect(readOutcome({ status: "answered", answer: 4 }, false)).toEqual({ raw: { status: "answered", answer: 4 } });
  });
});
