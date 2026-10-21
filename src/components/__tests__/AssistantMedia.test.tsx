import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { AudioPlayer } from "../assistant-ui/elements/AudioPlayer.js";
import { VideoPlayer } from "../assistant-ui/elements/VideoPlayer.js";
import { File as AssistantFile } from "../assistant-ui/elements/File.js";
import { AudioSourceFixture } from "../stories/assistant-ui/elements/helpers.js";
import audio from "../stories/assistant-ui/elements/fixtures/sample.wav?url";
import video from "../stories/assistant-ui/elements/fixtures/sample.webm?url";
import "../../../.storybook/preview.css";

afterEach(cleanup);

test("plays, pauses and seeks audio through trusted browser input", async () => {
  const view = render(<AudioPlayer src={audio} title="Narration" />);
  const media = view.container.querySelector("audio");
  if (!media) throw new Error("Audio element missing");
  await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
  await userEvent.click(view.getByRole("button", { name: "Play Narration" }));
  await waitFor(() => expect(media.paused).toBe(false));
  await userEvent.click(view.getByRole("button", { name: "Pause Narration" }));
  await waitFor(() => expect(media.paused).toBe(true));
  await userEvent.click(view.getByRole("slider", { name: "Seek" }));
  await userEvent.keyboard("{ArrowRight}");
  expect(media.currentTime).toBeGreaterThan(0);
});

test("recovers audio after a source error and pauses when its source changes", async () => {
  const view = render(<AudioSourceFixture />);
  expect(await view.findByRole("alert")).toHaveTextContent("Can't play this audio");
  await userEvent.click(view.getByRole("button", { name: "Load valid audio" }));
  await waitFor(() => expect(view.queryByRole("alert")).not.toBeInTheDocument());
  expect(view.getByText("Audio")).toBeVisible();
  expect(view.container.querySelector("img")).toHaveAttribute("alt", "");
  await userEvent.click(view.getByRole("button", { name: "Play audio" }));
  await waitFor(() => expect(view.getByRole("button", { name: "Pause audio" })).toBeVisible());
  await userEvent.click(view.getByRole("button", { name: "Change audio source" }));
  await waitFor(() => expect(view.getByRole("button", { name: "Play audio" })).toBeVisible());
  expect(view.getByRole("slider", { name: "Seek" })).toHaveValue("0");
});

test("plays audio attachments through their actual media renderer", async () => {
  const view = render(
    <AssistantFile
      type="file"
      data={new URL(audio, import.meta.url).href}
      mimeType="audio/wav"
      filename="voice.wav"
      sourceType="url"
      status={{ type: "complete" }}
    />,
  );
  await userEvent.click(view.getByRole("button", { name: "Play voice.wav" }));
  await waitFor(() => expect(view.getByRole("button", { name: "Pause voice.wav" })).toBeVisible());
  await userEvent.click(view.getByRole("button", { name: "Pause voice.wav" }));
  expect(view.getByRole("link", { name: "Download voice.wav" })).toHaveAttribute(
    "href",
    new URL(audio, import.meta.url).href,
  );
});

test("plays and pauses the native video control with browser activation", async () => {
  const view = render(<VideoPlayer src={video} title="Test pattern" />);
  const media = view.container.querySelector("video");
  if (!media) throw new Error("Video element missing");
  await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
  expect(media.controls).toBe(true);
  expect(media.duration).toBeCloseTo(2);
  expect(view.getByText("0:02")).toBeVisible();
  await userEvent.click(media);
  await media.play();
  expect(media.paused).toBe(false);
  media.pause();
  expect(media.paused).toBe(true);
});
