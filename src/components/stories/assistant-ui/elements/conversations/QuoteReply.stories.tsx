import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn, userEvent } from "storybook/test";
import { QuoteReply } from "../../../../assistant-ui/elements/QuoteReply.js";
const meta: Meta<typeof QuoteReply> = {
  component: QuoteReply,
  render: (args) => <QuoteReply {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/QuoteReply",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    before: "The ",
    selection: "request",
    after: " is ready.",
    actions: [{ key: "explain", label: "Explain", icon: "explain" }],
    toolbarVisible: true,
    onAction: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("request", { exact: true })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Explain" }));
    await expect(args.onAction).toHaveBeenCalledWith("explain");
  },
};
export const QuotedReply: Story = {
  ...Default,
  args: { ...Default.args, toolbarVisible: false, quoted: "The selected request" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("The selected request")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
