import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useTaskElapsed } from "../useTaskElapsed.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("ticks while running and disposes the clock when stopped", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(5000);
  const hook = renderHook((isRunning: boolean) => useTaskElapsed({ startedAt: 2000 }, isRunning), {
    initialProps: true,
  });
  expect(hook.result.current).toBe(3000);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(hook.result.current).toBe(4000);
  hook.rerender(false);
  expect(hook.result.current).toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);
});

test("reports completed duration without starting a timer and clamps negative elapsed time", () => {
  vi.useFakeTimers();
  const completed = renderHook(() => useTaskElapsed({ startedAt: 1000, completedAt: 4250 }, false));
  expect(completed.result.current).toBe(3250);
  const reversed = renderHook(() => useTaskElapsed({ startedAt: 1000, completedAt: 500 }, false));
  expect(reversed.result.current).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

test("returns no elapsed time without timing and cleans up on unmount", () => {
  vi.useFakeTimers();
  const missing = renderHook(() => useTaskElapsed(undefined, true));
  expect(missing.result.current).toBeUndefined();
  const running = renderHook(() => useTaskElapsed({ startedAt: 0 }, true));
  running.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
