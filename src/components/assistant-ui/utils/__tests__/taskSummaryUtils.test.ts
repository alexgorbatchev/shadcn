import { expect, test } from "vitest";
import { summarizeTasks, summaryLabel, summaryState } from "../taskSummaryUtils.js";
import { factory_taskState } from "./fixtures.js";

test("summarizes running tasks using their earliest known start and first label", () => {
  const summary = summarizeTasks([
    factory_taskState({ id: "first", status: { type: "running" }, timing: { startedAt: 200 } }),
    factory_taskState({
      id: "second",
      args: { description: "Second service" },
      status: { type: "running" },
      timing: { startedAt: 100 },
    }),
    factory_taskState({ id: "third", status: { type: "running" }, timing: { startedAt: 300 } }),
    factory_taskState({ id: "untimed", status: { type: "running" } }),
    factory_taskState({ id: "waiting", status: { type: "requires-action", reason: "tool-calls" } }),
    factory_taskState({ id: "error", isError: true }),
    factory_taskState({ id: "done" }),
  ]);
  expect(summary).toEqual({
    total: 7,
    running: 4,
    waiting: 1,
    failed: 1,
    startedAt: 100,
    runningLabel: "Inspect service",
  });
  expect(summaryState(summary)).toBe("working");
  expect(summaryLabel(summary)).toBe("4 of 7 tasks running");
});

test("gives one running task its domain description", () => {
  const summary = summarizeTasks([factory_taskState({ status: { type: "running" } })]);
  expect(summaryState(summary)).toBe("working");
  expect(summaryLabel(summary)).toBe("Inspect service");
  expect(summary.startedAt).toBeUndefined();
  expect(summaryLabel({ ...summary, runningLabel: undefined })).toBe("1 of 1 task running");
});

test("distinguishes waiting, failed, cancelled and completed task histories", () => {
  const waiting = summarizeTasks([factory_taskState({ status: { type: "requires-action", reason: "tool-calls" } })]);
  expect(summaryState(waiting)).toBe("waiting");
  expect(summaryLabel(waiting)).toBe("1 task waiting for input");
  const failed = summarizeTasks([factory_taskState({ status: { type: "incomplete", reason: "error" } })]);
  expect(summaryState(failed)).toBe("failed");
  expect(summaryLabel(failed)).toBe("1 task done, 1 failed");
  const cancelled = summarizeTasks([factory_taskState({ status: { type: "incomplete", reason: "cancelled" } })]);
  expect(summaryState(cancelled)).toBe("done");
  expect(summaryLabel(cancelled)).toBe("1 task done");
  expect(summaryLabel(summarizeTasks([]))).toBe("0 tasks done");
});
