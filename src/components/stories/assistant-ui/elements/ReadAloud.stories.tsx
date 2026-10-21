import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ReadAloud } from "../../../assistant-ui/elements/ReadAloud.js";
const meta: Meta<typeof ReadAloud> = {
  component: ReadAloud,
  render: (args) => <ReadAloud {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ReadAloud",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    words: ["Hello", "workspace"],
    spokenIndex: 1,
    playing: false,
    rate: 1,
    elapsed: "0:01",
    duration: "0:02",
    onToggle: fn(),
    onRateChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    await userEvent.click(canvas.getByRole("button", { name: "Play" }));
    await expect(args.onToggle).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Playback speed, currently 1 times" }));
    await expect(args.onRateChange).toHaveBeenCalledOnce();
  },
};
export const Playing: Story = {
  ...Default,
  args: { ...Default.args, playing: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Pause" }));
    await expect(args.onToggle).toHaveBeenCalledOnce();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
