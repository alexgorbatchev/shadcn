import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { SubagentList } from "../../../assistant-ui/elements/SubagentList.js";
const meta: Meta<typeof SubagentList> = {
  component: SubagentList,
  render: (args) => <SubagentList {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/SubagentList",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    agents: [{ name: "Reviewer", model: "Review model" }],
    completedCount: 1,
    progress: [100],
    showSummary: true,
    summaryAgent: { name: "Coordinator", model: "Planning model" },
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Reviewer")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Coordinator")).toBeVisible());
    await expect(canvas.getByRole("progressbar", { name: "Reviewer progress" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    await expect(canvas.getByRole("progressbar", { name: "Coordinator progress" })).not.toHaveAttribute(
      "aria-valuenow",
    );
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
