import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { RunActivity } from "../../../../assistant-ui/elements/RunActivity.js";
const meta: Meta<typeof RunActivity> = {
  component: RunActivity,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/agents-tasks/RunActivity",
  render: (args) => <RunActivity {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    status: "complete",
    statusLabel: "Review complete",
    durationLabel: "2 seconds",
    entries: [{ id: "one", kind: "tool", label: "Read package manifests", content: "3 packages found" }],
    open: true,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("3 packages found")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Review complete/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
