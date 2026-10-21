import { act, cleanup } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { factory_attachmentHook } from "./fixtures/fixtures.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("reads image content from the actual native attachment runtime", () => {
  const hook = factory_attachmentHook({
    id: "image",
    type: "image",
    name: "Reference",
    status: { type: "complete" },
    content: [{ type: "image", image: "https://example.com/reference.png" }],
  });
  expect(hook.result.current).toBe("https://example.com/reference.png");
});

test("allocates a native file URL, retains it across rerenders and revokes it on unmount", async () => {
  const file = new File(["image content"], "reference.png", { type: "image/png" });
  const created = vi.spyOn(URL, "createObjectURL");
  const revoked = vi.spyOn(URL, "revokeObjectURL");
  const hook = factory_attachmentHook({
    id: "file",
    type: "image",
    name: file.name,
    file,
    status: { type: "complete" },
    content: [],
  });
  const url = hook.result.current;
  expect(url).toBeTypeOf("string");
  expect(created).toHaveBeenCalledTimes(1);
  await act(async () => {
    expect(await (await fetch(url ?? "")).text()).toBe("image content");
  });
  hook.rerender();
  expect(hook.result.current).toBe(url);
  expect(created).toHaveBeenCalledTimes(1);
  hook.unmount();
  expect(revoked).toHaveBeenCalledWith(url);
});

test("does not expose a document attachment as an image", () => {
  const hook = factory_attachmentHook({
    id: "document",
    type: "document",
    name: "Notes",
    status: { type: "complete" },
    content: [{ type: "text", text: "Notes" }],
  });
  expect(hook.result.current).toBeUndefined();
});
