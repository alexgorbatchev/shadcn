import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ResearchReport } from "../../../../assistant-ui/elements/ResearchReport.js";
const meta: Meta<typeof ResearchReport> = {
  component: ResearchReport,
  render: (args) => <ResearchReport {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/sources-research/ResearchReport",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    title: "Workspace analysis",
    sections: [
      { id: "one", heading: "Dependencies", state: "done", sources: 2, preview: "All dependencies are pinned." },
    ],
    sourcesRead: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Dependencies")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("All dependencies are pinned.")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
