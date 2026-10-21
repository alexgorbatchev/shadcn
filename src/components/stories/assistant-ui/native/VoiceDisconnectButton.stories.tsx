import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VoiceDisconnectButton } from "../../../assistant-ui/native/VoiceDisconnectButton.js";
import { NativeVoiceFixture } from "./fixtures/nz/NativeVoiceFixture.js";
import { VoiceStatusDot } from "../../../assistant-ui/native/VoiceStatusDot.js";
const meta: Meta<typeof VoiceDisconnectButton> = {
  component: VoiceDisconnectButton,
  title: "shadcn-alexgorbatchev/assistant-ui/native/VoiceDisconnectButton",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceDisconnectButton />
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
    await userEvent.click(canvas.getByRole("button", { name: "Disconnect" }));
    await waitFor(() => expect(canvas.getByRole("status", { name: "Voice idle" })).toBeVisible());
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
