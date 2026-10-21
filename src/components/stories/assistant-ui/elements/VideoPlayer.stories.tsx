import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import video from "./fixtures/sample.webm?url";
import { VideoPlayer } from "../../../assistant-ui/elements/VideoPlayer.js";
const meta: Meta<typeof VideoPlayer> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs", "test"],
  args: { src: video, title: "Test pattern" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const NativePlayback: Story = {
  play: async ({ canvasElement }) => {
    const media = within(canvasElement).getByLabelText<HTMLVideoElement>("Test pattern");
    await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
    await expect(media.controls).toBe(true);
    await expect(media.duration).toBeCloseTo(2);
    await expect(within(canvasElement).getByText("0:02")).toBeVisible();
    await expect(media.paused).toBe(true);
  },
};
export const Portrait: Story = {
  args: { ratio: "9:16", durationMs: 125000 },
  play: async ({ canvasElement }) => {
    const media = within(canvasElement).getByLabelText<HTMLVideoElement>("Test pattern");
    await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
    const bounds = media.getBoundingClientRect();
    await expect(bounds.height).toBeGreaterThan(bounds.width);
    await expect(within(canvasElement).getByText("0:02")).toBeVisible();
  },
};
