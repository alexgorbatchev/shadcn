import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import type { RefObject } from "react";
import video from "../../../stories/assistant-ui/elements/fixtures/sample.webm?url";
import { useMediaDuration } from "../useMediaDuration.js";
afterEach(cleanup);
describe("useMediaDuration", () => {
  test("uses real metadata already available before mounting", async () => {
    const media = document.createElement("video");
    media.src = video;
    media.preload = "metadata";
    document.body.append(media);
    try {
      await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
      const ref: RefObject<HTMLVideoElement | null> = { current: media };
      const { result } = renderHook(() => useMediaDuration(ref, video, 9000));
      await waitFor(() => expect(result.current.duration).toBeCloseTo(2));
    } finally {
      media.remove();
    }
  });
  test("uses a normalized fallback until the source metadata is known", () => {
    const ref: RefObject<HTMLMediaElement | null> = { current: null };
    const { result, rerender } = renderHook(({ src, durationMs }) => useMediaDuration(ref, src, durationMs), {
      initialProps: { src: "first", durationMs: 125000 },
    });
    expect(result.current.duration).toBe(125);
    rerender({ src: "second", durationMs: -1 });
    expect(result.current.duration).toBe(0);
    rerender({ src: "third", durationMs: Number.NaN });
    expect(result.current.duration).toBeUndefined();
  });
});
