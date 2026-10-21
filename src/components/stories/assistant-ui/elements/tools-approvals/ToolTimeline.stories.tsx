import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ToolTimeline } from "../../../../assistant-ui/elements/ToolTimeline.js";
import { FileTextIcon } from "lucide-react";
const meta: Meta<typeof ToolTimeline> = {
  component: ToolTimeline,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/tools-approvals/ToolTimeline",
  render: (args) => <ToolTimeline {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    steps: [{ id: "one", verb: "Read", chip: "package.json", icon: FileTextIcon }],
    visibleSteps: 1,
    streaming: false,
    open: true,
    onOpenChange: fn(),
    restingLabel: "Source reviewed",
    activeLabel: "Reviewing source",
    stats: [{ file: "workspace.ts", added: 2, removed: 1 }],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("package.json")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Source reviewed/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
