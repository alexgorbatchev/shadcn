import { expect, test } from "vitest";
import { formatUnknownValue, offersInterruptAction } from "../ToolFallbackRoot.js";

test("formats string, error, bigint, undefined and symbolic tool results", () => {
  expect(formatUnknownValue("Done")).toBe("Done");
  expect(formatUnknownValue(new Error("Tool failed"))).toBe("Error: Tool failed");
  expect(formatUnknownValue(10n)).toBe("10");
  expect(formatUnknownValue(undefined)).toBe("undefined");
  expect(formatUnknownValue(Symbol("result"))).toBe("Symbol(result)");
  expect(formatUnknownValue({ ready: true }, 2)).toBe('{\n  "ready": true\n}');
});

test("does not fabricate actions for an interrupt missing its payload", () => {
  expect(offersInterruptAction(undefined, undefined, undefined)).toBe(true);
  expect(offersInterruptAction({ type: "complete" }, undefined, undefined)).toBe(true);
  expect(offersInterruptAction({ type: "requires-action", reason: "tool-calls" }, undefined, undefined)).toBe(true);
  expect(offersInterruptAction({ type: "requires-action", reason: "interrupt" }, undefined, undefined)).toBe(false);
  expect(offersInterruptAction({ type: "requires-action", reason: "interrupt" }, { id: "permission" }, undefined)).toBe(
    true,
  );
  expect(
    offersInterruptAction({ type: "requires-action", reason: "interrupt" }, undefined, {
      type: "human",
      payload: "Review",
    }),
  ).toBe(true);
});
