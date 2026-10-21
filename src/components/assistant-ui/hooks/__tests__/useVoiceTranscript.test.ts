import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { useVoiceTranscript } from "../useVoiceTranscript.js";
import { createVoiceTranscriptFixture } from "./fixtures/VoiceTranscriptProvider.js";

afterEach(cleanup);
test("keeps the first provider transcript when connection and transcript commit together", async () => {
  const fixture = createVoiceTranscriptFixture();
  const hook = renderHook(useVoiceTranscript, { wrapper: fixture.Wrapper });
  expect(hook.result.current).toEqual([]);
  await act(async () => {
    fixture.connect();
    fixture.driver.connected();
    fixture.driver.transcript("user", "Inspect the project");
  });
  expect(hook.result.current).toMatchObject([{ role: "user", text: "Inspect the project" }]);
  await act(async () => {
    fixture.driver.end();
  });
  expect(hook.result.current).toEqual([]);
  await act(async () => {
    fixture.connect();
    fixture.driver.connected();
    fixture.driver.transcript("assistant", "A new session");
  });
  expect(hook.result.current).toMatchObject([{ role: "assistant", text: "A new session" }]);
});
