import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VoiceControl } from "../../../assistant-ui/native/VoiceControl.js";
import { NativeVoiceFixture } from "./fixtures/nz/NativeVoiceFixture.js";

const meta: Meta<typeof VoiceControl> = {
  component: VoiceControl,
  title: "shadcn-alexgorbatchev/assistant-ui/native/VoiceControl",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceControl />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Connect" }));
    await expect(canvas.getByText("Connecting...")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await userEvent.click(canvas.getByRole("button", { name: "Mute" }));
    await expect(canvas.getByRole("button", { name: "Unmute" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Unmute" }));
    await userEvent.click(canvas.getByRole("button", { name: "Disconnect" }));
    await expect(canvas.getByRole("button", { name: "Connect" })).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
