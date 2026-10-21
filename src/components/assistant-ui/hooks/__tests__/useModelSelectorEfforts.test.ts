import { act, cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { renderModelSelectorHook } from "./parentHelpers.js";

afterEach(cleanup);
test("only exposes an effort supported by the currently selected model", () => {
  const hook = renderModelSelectorHook(
    [
      { id: "first", name: "First", efforts: true },
      { id: "second", name: "Second", efforts: [{ id: "minimal", name: "Minimal" }] },
    ],
    "low",
  );
  expect(hook.result.current.efforts.effort).toBe("low");
  act(() => hook.result.current.context.setValue("second"));
  expect(hook.result.current.efforts.effort).toBeUndefined();
  act(() => hook.result.current.efforts.setEffort("minimal"));
  expect(hook.result.current.efforts.effort).toBe("minimal");
  expect(hook.result.current.context.effort).toBe("minimal");
});
