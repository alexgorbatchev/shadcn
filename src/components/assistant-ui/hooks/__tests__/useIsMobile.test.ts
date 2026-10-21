import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { useIsMobile } from "../useIsMobile.js";

beforeEach(async () => {
  await page.viewport(1024, 768);
});
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await page.viewport(1024, 768);
});

test("follows the browser media query across the mobile boundary", async () => {
  const hook = renderHook(useIsMobile);
  expect(hook.result.current).toBe(false);
  const changed = Promise.withResolvers<void>();
  window.matchMedia("(max-width: 767px)").addEventListener("change", () => changed.resolve(), { once: true });
  await act(async () => {
    await page.viewport(767, 768);
    await changed.promise;
  });
  expect(hook.result.current).toBe(true);
});

test("releases its native media subscription on unmount", () => {
  const added = vi.spyOn(MediaQueryList.prototype, "addEventListener");
  const removed = vi.spyOn(MediaQueryList.prototype, "removeEventListener");
  const hook = renderHook(useIsMobile);
  hook.unmount();
  expect(removed.mock.calls).toEqual(added.mock.calls);
});
