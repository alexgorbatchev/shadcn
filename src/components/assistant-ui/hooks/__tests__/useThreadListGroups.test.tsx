import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { useAui } from "@assistant-ui/react";
import { NativeRuntimeFixture } from "../../../stories/assistant-ui/native/helpers.js";
import { useThreadListGroups } from "../useThreadListGroups.js";

afterEach(cleanup);

test("tracks actual runtime creation, rename, search, and archive", async () => {
  const hook = renderHook((query: string) => ({ groups: useThreadListGroups(query), aui: useAui() }), {
    initialProps: "",
    wrapper: NativeRuntimeFixture,
  });
  expect(hook.result.current.groups.filteredIndices).toEqual([]);
  await act(async () => {
    hook.result.current.aui.thread().append("Review this page.");
  });
  await waitFor(() => expect(hook.result.current.groups.filteredIndices).toEqual([0]));
  await act(async () => {
    hook.result.current.aui.threads().item({ index: 0 }).rename("Page review");
  });
  hook.rerender(" PAGE ");
  expect(hook.result.current.groups.filteredIndices).toEqual([0]);
  hook.rerender("Unrelated");
  expect(hook.result.current.groups.filteredIndices).toEqual([]);
  hook.rerender("");
  await act(async () => {
    hook.result.current.aui.threads().item({ index: 0 }).archive();
  });
  expect(hook.result.current.groups.filteredIndices).toEqual([]);
});
