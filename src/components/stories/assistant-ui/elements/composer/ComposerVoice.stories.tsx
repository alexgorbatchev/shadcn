import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ComposerVoice } from "../../../../assistant-ui/elements/ComposerVoice.js";
import { fixture_composerAudioLevels } from "../fixtures.js";
const meta: Meta<typeof ComposerVoice> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerVoice",
  component: ComposerVoice,
  tags: ["autodocs", "test"],
  args: { recording: true, seconds: 7, audioLevels: fixture_composerAudioLevels },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Recording: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("0:07")).toBeVisible();
    const levels = canvas.getAllByTestId("ComposerVoice--audio-level");
    await expect(levels).toHaveLength(args.audioLevels?.length ?? 0);
    const heights = levels.map((level) => level.getBoundingClientRect().height);
    await expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
  },
};
export const LongRecording: Story = {
  args: { seconds: 125 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("2:05")).toBeVisible();
  },
};
export const WithoutSamples: Story = {
  args: { audioLevels: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("0:07")).toBeVisible();
    await expect(canvas.queryByTestId("ComposerVoice--audio-level")).not.toBeInTheDocument();
  },
};
export const Transcribing: Story = {
  args: { recording: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Transcribing");
    await expect(canvas.queryByText("0:07")).not.toBeInTheDocument();
  },
};
