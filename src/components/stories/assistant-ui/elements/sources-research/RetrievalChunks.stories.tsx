import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { RetrievalChunks } from "../../../../assistant-ui/elements/RetrievalChunks.js";
const meta: Meta<typeof RetrievalChunks> = {
  component: RetrievalChunks,
  render: (args) => <RetrievalChunks {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/sources-research/RetrievalChunks",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    query: "workspace",
    chunks: [
      { id: "one", source: "README.md", locator: "lines 1–10", score: 0.95, text: "Workspace setup instructions" },
    ],
    visibleCount: 1,
    searching: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("README.md")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Workspace setup instructions")).toBeVisible());
    await expect((canvas.getByRole("meter", { name: "README.md relevance score" }) as HTMLMeterElement).value).toBe(95);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
