import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useStartOfToday } from "../useStartOfToday.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("advances at local midnight and removes its owned timer on unmount", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 20, 23, 59, 59));
  const hook = renderHook(() => useStartOfToday());
  expect(hook.result.current).toBe(new Date(2026, 9, 20).getTime());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(hook.result.current).toBe(new Date(2026, 9, 21).getTime());
  expect(vi.getTimerCount()).toBe(1);
  hook.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
