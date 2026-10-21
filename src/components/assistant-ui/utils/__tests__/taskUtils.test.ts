import { expect, test } from "vitest";
import { firstString, formatElapsed, taskLabel, taskMeta, taskStateOf } from "../taskUtils.js";

test.each([null, undefined, "description", 3, false])("ignores non-object task arguments: %s", (args) => {
  expect(firstString(args, ["description"])).toBeUndefined();
  expect(taskLabel("inspect", args)).toBe("inspect");
  expect(taskMeta(args)).toBeUndefined();
});

test("selects the first nonblank task description and model metadata", () => {
  expect(firstString({ title: 4, name: " ", description: " Review " }, ["title", "name", "description"])).toBe(
    "Review",
  );
  expect(taskLabel("inspect", { description: "", task: " Inspect sources " })).toBe("Inspect sources");
  expect(taskMeta({ subagent_type: "", model: " model-id " })).toBe("model-id");
});

test("distinguishes active, blocked, cancelled, failed and successful tasks", () => {
  expect(taskStateOf({ type: "running" }, true)).toBe("working");
  expect(taskStateOf({ type: "requires-action", reason: "tool-calls" })).toBe("waiting");
  expect(taskStateOf({ type: "incomplete", reason: "cancelled" })).toBe("cancelled");
  expect(taskStateOf({ type: "incomplete", reason: "error" })).toBe("failed");
  expect(taskStateOf({ type: "complete" }, true)).toBe("failed");
  expect(taskStateOf({ type: "complete" })).toBe("done");
});

test.each([
  [0, "<1s"],
  [999, "<1s"],
  [1500, "1.5s"],
  [9999, "9.9s"],
  [10000, "10s"],
  [59999, "59s"],
  [61000, "1m 1s"],
])("formats an elapsed task duration of %s milliseconds", (duration, expected) =>
  expect(formatElapsed(Number(duration))).toBe(expected),
);
