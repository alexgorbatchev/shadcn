import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { VoiceOrb } from "../../../../assistant-ui/elements/VoiceOrb.js";
const meta: Meta<typeof VoiceOrb> = {
  component: VoiceOrb,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/VoiceOrb",
  render: (args) => <VoiceOrb {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { state: "idle", volume: 0, variant: "default" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toHaveAccessibleName("Voice activity: idle");
  },
};
export const Connecting: Story = {
  ...Default,
  args: { ...Default.args, state: "connecting" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toHaveAccessibleName("Voice activity: connecting");
  },
};
export const Listening: Story = {
  ...Default,
  args: { ...Default.args, state: "listening" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toHaveAccessibleName("Voice activity: listening");
  },
};
export const Speaking: Story = {
  ...Default,
  args: { ...Default.args, state: "speaking" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toHaveAccessibleName("Voice activity: speaking");
  },
};
export const Muted: Story = {
  ...Default,
  args: { ...Default.args, state: "muted" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toHaveAccessibleName("Voice activity: muted");
  },
};
export const Primary: Story = {
  ...Default,
  args: { ...Default.args, variant: "primary" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toBeVisible();
  },
};
export const Warning: Story = {
  ...Default,
  args: { ...Default.args, variant: "warning" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toBeVisible();
  },
};
export const Success: Story = {
  ...Default,
  args: { ...Default.args, variant: "success" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("VoiceOrb")).toBeVisible();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
