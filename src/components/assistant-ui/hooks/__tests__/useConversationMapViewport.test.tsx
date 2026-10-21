import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { cdp } from "vitest/browser";
import { useAuiState } from "@assistant-ui/react";
import { ConversationMapViewportFixture } from "../../../stories/assistant-ui/native/fixtures/conversationMap.js";
import { useConversationProjection } from "../useConversationProjection.js";
import { useConversationMapViewport } from "../useConversationMapViewport.js";
import "../../../../../.storybook/preview.css";

afterEach(async () => {
  cleanup();
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
});

test("measures actual native messages and scrolls only their thread viewport", async () => {
  const hook = renderHook(
    () => useConversationMapViewport(useConversationProjection(useAuiState((state) => state.thread.messages))),
    { wrapper: ConversationMapViewportFixture },
  );
  await waitFor(() => expect(hook.result.current.activeId).toBe("question-0"));
  expect(hook.result.current.viewportHeight).toBeGreaterThan(0);
  expect(hook.result.current.visibleIds).toContain("question-0");
  const documentScroll = document.documentElement.scrollTop;
  await act(async () => {
    hook.result.current.select("question-0");
  });
  await waitFor(() => expect(hook.result.current.activeId).toBe("question-0"));
  await act(async () => {
    hook.result.current.select("question-7");
  });
  await waitFor(() => expect(hook.result.current.activeId).toBe("question-7"));
  expect(document.documentElement.scrollTop).toBe(documentScroll);
  await act(async () => {
    hook.result.current.select("missing-message");
  });
  expect(hook.result.current.activeId).toBe("question-7");
  await act(async () => {
    hook.result.current.select("question-0");
  });
  await waitFor(() => expect(hook.result.current.activeId).toBe("question-0"));
});

test("jumps immediately when the browser requests reduced motion", async () => {
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const hook = renderHook(
    () => useConversationMapViewport(useConversationProjection(useAuiState((state) => state.thread.messages))),
    { wrapper: ConversationMapViewportFixture },
  );
  await waitFor(() => expect(hook.result.current.activeId).toBe("question-0"));
  const viewport = document.querySelector('[aria-label="Conversation messages"]');
  expect(viewport).toBeInstanceOf(HTMLElement);
  await act(async () => {
    hook.result.current.select("question-7");
  });
  expect(viewport?.scrollTop).toBe((viewport?.scrollHeight ?? 0) - (viewport?.clientHeight ?? 0));
});
