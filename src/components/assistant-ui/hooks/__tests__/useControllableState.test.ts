import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useControllableState } from "../useControllableState.js";

afterEach(cleanup);
test("updates uncontrolled state and the current callback", () => {
  const first = vi.fn();
  const second = vi.fn();
  const hook = renderHook(({ onChange }) => useControllableState({ prop: undefined, defaultProp: "first", onChange }), {
    initialProps: { onChange: first },
  });
  act(() => hook.result.current[1]("second"));
  expect(hook.result.current[0]).toBe("second");
  expect(first).toHaveBeenCalledWith("second");
  hook.rerender({ onChange: second });
  act(() => hook.result.current[1]("third"));
  expect(second).toHaveBeenCalledWith("third");
  expect(first).toHaveBeenCalledTimes(1);
});
test("leaves a controlled choice with its caller", () => {
  const onChange = vi.fn();
  const hook = renderHook(({ prop }) => useControllableState({ prop, defaultProp: "fallback", onChange }), {
    initialProps: { prop: "first" },
  });
  act(() => hook.result.current[1]("second"));
  expect(hook.result.current[0]).toBe("first");
  expect(onChange).toHaveBeenCalledWith("second");
  hook.rerender({ prop: "second" });
  expect(hook.result.current[0]).toBe("second");
});
