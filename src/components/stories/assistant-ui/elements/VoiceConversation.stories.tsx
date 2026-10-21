import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { VoiceConversation } from "../../../assistant-ui/elements/VoiceConversation.js";
const meta: Meta<typeof VoiceConversation> = {
  component: VoiceConversation,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/VoiceConversation",
  render: (args) => <VoiceConversation {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    mode: "speaking",
    amplitude: 0.5,
    transcript: [{ id: "one", role: "assistant", text: "Your workspace is ready" }],
    muted: false,
    onToggleMute: fn(),
    onInterrupt: fn(),
    onEnd: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Interrupt the assistant" }));
    await expect(args.onInterrupt).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Turn the microphone off" }));
    await expect(args.onToggleMute).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "End the call" }));
    await expect(args.onEnd).toHaveBeenCalledOnce();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
