import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VoiceMuteButton } from "../../../../assistant-ui/native/VoiceMuteButton.js";
import { NativeVoiceFixture } from "../fixtures/nz/NativeVoiceFixture.js";
import { VoiceStatusDot } from "../../../../assistant-ui/native/VoiceStatusDot.js";
const meta: Meta<typeof VoiceMuteButton> = {
  component: VoiceMuteButton,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/media-voice/VoiceMuteButton",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceMuteButton />
      <VoiceStatusDot />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await userEvent.click(canvas.getByRole("button", { name: "Mute" }));
    await waitFor(() => expect(canvas.getByRole("status", { name: "Voice muted" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Unmute" }));
    await waitFor(() => expect(canvas.getByRole("status", { name: "Voice listening" })).toBeVisible());
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
export const Inactive: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Mute" })).toBeDisabled();
  },
};
