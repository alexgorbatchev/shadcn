import { act, cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { renderModelSelectorHook } from "./parentHelpers.js";

afterEach(cleanup);
test("updates the selected model and popover state independently", () => {
  const hook = renderModelSelectorHook([
    { id: "first", name: "First" },
    { id: "second", name: "Second" },
  ]);
  expect(hook.result.current.context.selectedModel?.name).toBe("First");
  act(() => hook.result.current.context.setValue("second"));
  expect(hook.result.current.context.selectedModel?.name).toBe("Second");
  expect(hook.result.current.context.open).toBe(false);
  act(() => hook.result.current.context.setOpen(true));
  expect(hook.result.current.context.open).toBe(true);
  expect(hook.result.current.context.value).toBe("second");
});
