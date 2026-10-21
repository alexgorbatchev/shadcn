import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useCopyToClipboard } from "../useCopyToClipboard.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("copies actual text and restarts the feedback duration for a repeated copy", async () => {
  vi.useFakeTimers();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const hook = renderHook(() => useCopyToClipboard({ copiedDuration: 100 }));
  await act(async () => {
    hook.result.current.copyToClipboard("first");
  });
  expect(write).toHaveBeenCalledWith("first");
  expect(hook.result.current.isCopied).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(75);
    hook.result.current.copyToClipboard("second");
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(75);
  });
  expect(hook.result.current.isCopied).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(25);
  });
  expect(hook.result.current.isCopied).toBe(false);
});

test("does not report a failed or empty clipboard write as copied", async () => {
  const write = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
  const hook = renderHook(useCopyToClipboard);
  await act(async () => {
    hook.result.current.copyToClipboard("");
  });
  expect(write).not.toHaveBeenCalled();
  await act(async () => {
    hook.result.current.copyToClipboard("denied");
  });
  expect(hook.result.current.isCopied).toBe(false);
});

test("ignores a clipboard completion after its owner unmounts", async () => {
  vi.useFakeTimers();
  const pending = Promise.withResolvers<void>();
  vi.spyOn(navigator.clipboard, "writeText").mockReturnValue(pending.promise);
  const hook = renderHook(useCopyToClipboard);
  act(() => {
    hook.result.current.copyToClipboard("pending");
  });
  hook.unmount();
  await act(async () => {
    pending.resolve();
  });
  expect(vi.getTimerCount()).toBe(0);
});
