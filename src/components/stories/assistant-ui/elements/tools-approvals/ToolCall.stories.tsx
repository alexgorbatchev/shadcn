import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ToolCall } from "../../../../assistant-ui/elements/ToolCall.js";
const meta: Meta<typeof ToolCall> = {
  component: ToolCall,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/tools-approvals/ToolCall",
  render: (args) => <ToolCall {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    label: "Read source",
    activeLabel: "Reading source",
    query: "package.json",
    request: "Read the package manifest",
    result: "3 dependencies",
    running: false,
    open: true,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("3 dependencies")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Read source/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
