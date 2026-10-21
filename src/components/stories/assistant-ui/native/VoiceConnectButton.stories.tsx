import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VoiceConnectButton } from "../../../assistant-ui/native/VoiceConnectButton.js";
import { NativeVoiceFixture } from "./fixtures/nz/NativeVoiceFixture.js";
import { VoiceStatusDot } from "../../../assistant-ui/native/VoiceStatusDot.js";
const meta: Meta<typeof VoiceConnectButton> = {
  component: VoiceConnectButton,
  title: "shadcn-alexgorbatchev/assistant-ui/native/VoiceConnectButton",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceConnectButton />
      <VoiceStatusDot />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Connect" }));
    await waitFor(() => expect(canvas.getByRole("status", { name: "Voice connecting" })).toBeVisible());
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
export const PendingToolAction: Story = {
  render: () => (
    <NativeVoiceFixture
      initialMessages={[
        {
          role: "assistant",
          content: [{ type: "text", text: "Waiting for approval" }],
          status: { type: "requires-action", reason: "tool-calls" },
        },
      ]}
    >
      <VoiceConnectButton />
    </NativeVoiceFixture>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Connect" })).toBeDisabled();
  },
};
