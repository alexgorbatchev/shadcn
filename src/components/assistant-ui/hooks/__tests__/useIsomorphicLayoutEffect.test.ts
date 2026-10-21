import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect.js";
import { useEffect, useLayoutEffect } from "react";

afterEach(cleanup);

test("runs browser layout setup before renderHook returns and disposes it on unmount", () => {
  const dispose = vi.fn();
  const setup = vi.fn(() => dispose);
  const hook = renderHook(() => useIsomorphicLayoutEffect(setup, []));
  expect(setup).toHaveBeenCalledTimes(1);
  hook.unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
});

test("runs in the browser layout phase before passive effects", () => {
  const phases: string[] = [];
  renderHook(() => {
    useIsomorphicLayoutEffect(() => {
      phases.push("isomorphic layout");
    }, []);
    useLayoutEffect(() => {
      phases.push("following layout");
    }, []);
    useEffect(() => {
      phases.push("passive");
    }, []);
  });
  expect(phases).toEqual(["isomorphic layout", "following layout", "passive"]);
});
