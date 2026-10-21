import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import audio from "../fixtures/sample.wav?url";
import { AudioPlayer } from "../../../../assistant-ui/elements/AudioPlayer.js";
import { AudioSourceFixture } from "../helpers.js";
const meta: Meta<typeof AudioPlayer> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs", "test"],
  args: { src: audio, title: "Narration" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Playback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvasElement.querySelector("audio");
    if (!media) throw new Error("Audio element missing");
    await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
    await expect(canvas.getByRole("button", { name: "Play Narration" })).toBeEnabled();
    await expect(canvas.getByRole("slider", { name: "Seek" })).toHaveValue("0");
  },
};
export const LoadFailure: Story = {
  args: { src: "data:audio/mpeg;base64,broken" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Can't play this audio");
    await expect(canvas.getByRole("button", { name: "Play Narration" })).toBeDisabled();
    await expect(canvas.getByRole("slider")).toBeDisabled();
  },
};
export const SourceRecovery: Story = {
  render: () => <AudioSourceFixture />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Can't play this audio");
    await userEvent.click(canvas.getByRole("button", { name: "Load valid audio" }));
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument());
    await expect(canvas.getByText("Audio")).toBeVisible();
    await expect(canvasElement.querySelector("img")).toHaveAttribute("alt", "");
    await expect(canvas.getByRole("button", { name: "Play audio" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Change audio source" }));
    await expect(await canvas.findByRole("button", { name: "Play audio" })).toBeVisible();
    await expect(canvas.getByRole("slider", { name: "Seek" })).toHaveValue("0");
  },
};
