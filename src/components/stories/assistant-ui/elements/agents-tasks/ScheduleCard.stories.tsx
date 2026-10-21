import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn } from "storybook/test";
import { ScheduleCard } from "../../../../assistant-ui/elements/ScheduleCard.js";
const meta: Meta<typeof ScheduleCard> = {
  component: ScheduleCard,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/agents-tasks/ScheduleCard",
  render: (args) => <ScheduleCard {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    name: "Review source",
    cadence: "Every weekday",
    nextRun: "Tomorrow at 9 AM",
    enabled: true,
    history: [{ id: "one", at: "Today", ok: true }],
    onToggle: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("switch", { name: "Pause Review source" })).toBeChecked();
    await userEvent.click(canvas.getByRole("switch"));
    await expect(args.onToggle).toHaveBeenCalledOnce();
  },
};
export const Paused: Story = {
  ...Default,
  args: { ...Default.args, enabled: false },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("switch", { name: "Resume Review source" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("switch"));
    await expect(args.onToggle).toHaveBeenCalledOnce();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ReadOnly: Story = {
  ...Default,
  args: { ...Default.args, onToggle: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("switch", { name: "Pause Review source" })).toHaveAttribute("aria-disabled", "true");
  },
};
