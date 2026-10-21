import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ReasoningPanel } from "../../../assistant-ui/elements/ReasoningPanel.js";
const meta: Meta<typeof ReasoningPanel> = {
  component: ReasoningPanel,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ReasoningPanel",
  render: (args) => <ReasoningPanel {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    steps: [{ title: "Inspect dependencies", body: "Read the package manifest before changing source." }],
    visibleSteps: 1,
    streaming: false,
    open: true,
    restingLabel: "Reasoning complete",
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Inspect dependencies")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Reasoning complete/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
