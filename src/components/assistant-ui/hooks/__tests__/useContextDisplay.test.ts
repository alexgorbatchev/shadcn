import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { renderContextUsageHook } from "./parentHelpers.js";

afterEach(cleanup);

test("retains the last total while usage streams, then resets for another conversation", () => {
  const { hook, update } = renderContextUsageHook({ totalTokens: 3000, inputTokens: 2000 }, 10000);
  expect(hook.result.current.totalTokens).toBe(3000);
  expect(hook.result.current.percent).toBe(30);
  update({ outputTokens: 200 });
  expect(hook.result.current.totalTokens).toBe(3000);
  expect(hook.result.current.usage?.outputTokens).toBe(200);
  update({ outputTokens: 200 }, "second");
  expect(hook.result.current.totalTokens).toBe(0);
  update({ totalTokens: 500 });
  expect(hook.result.current.percent).toBe(5);
});

test("keeps separate mounted conversation usage independent", () => {
  const first = renderContextUsageHook({ totalTokens: 1000 }, 10000);
  const second = renderContextUsageHook({ totalTokens: 8000 }, 20000);
  expect(first.hook.result.current.percent).toBe(10);
  expect(second.hook.result.current.percent).toBe(40);
  first.hook.unmount();
  expect(second.hook.result.current.totalTokens).toBe(8000);
});
