import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ReasoningEffort } from "../../../assistant-ui/elements/ReasoningEffort.js";
const meta: Meta<typeof ReasoningEffort> = {
  component: ReasoningEffort,
  render: (args) => <ReasoningEffort {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ReasoningEffort",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    levels: [
      { key: "low", label: "Low", budget: 100 },
      { key: "high", label: "High", budget: 1000 },
    ],
    selectedKey: "low",
    spent: 25,
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Low" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    await userEvent.click(canvas.getByRole("button", { name: "High" }));
    await expect(args.onSelect).toHaveBeenCalledWith("high");
  },
};
export const ReadOnly: Story = {
  ...Default,
  args: { ...Default.args, onSelect: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Low", { exact: true })).toHaveAttribute("aria-current", "true");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
