import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { VoiceStatusDot } from "../../../assistant-ui/native/VoiceStatusDot.js";
import { NativeVoiceFixture } from "./fixtures/nz/NativeVoiceFixture.js";

const meta: Meta<typeof VoiceStatusDot> = {
  component: VoiceStatusDot,
  title: "shadcn-alexgorbatchev/assistant-ui/native/VoiceStatusDot",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceStatusDot />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Voice idle" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await expect(canvas.getByRole("status", { name: "Voice connecting" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await expect(canvas.getByRole("status", { name: "Voice listening" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider speaking" }));
    await expect(canvas.getByRole("status", { name: "Voice speaking" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider ended" }));
    await expect(canvas.getByRole("status", { name: "Voice idle" })).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};

export const ReducedMotion: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    const status = canvas.getByRole("status", { name: "Voice connecting" });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await waitFor(() => expect(status.getAnimations()).toHaveLength(0));
    }
  },
};
