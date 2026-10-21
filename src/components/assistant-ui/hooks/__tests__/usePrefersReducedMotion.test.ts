import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion.js";

type MotionPreference = "reduce" | "no-preference";
async function preferMotion(value: MotionPreference): Promise<void> {
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value }] });
}

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await preferMotion("no-preference");
});

test("follows the real browser motion preference", async () => {
  await preferMotion("no-preference");
  const hook = renderHook(() => usePrefersReducedMotion());
  expect(hook.result.current).toBe(false);
  const reported = Promise.withResolvers<void>();
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", () => reported.resolve(), { once: true });
  await act(async () => {
    await preferMotion("reduce");
    await reported.promise;
  });
  expect(hook.result.current).toBe(true);
});

test("removes its native subscription on unmount", () => {
  const added = vi.spyOn(MediaQueryList.prototype, "addEventListener");
  const removed = vi.spyOn(MediaQueryList.prototype, "removeEventListener");
  const hook = renderHook(() => usePrefersReducedMotion());
  expect(added).toHaveBeenCalledTimes(1);
  hook.unmount();
  expect(removed.mock.calls).toEqual(added.mock.calls);
});
