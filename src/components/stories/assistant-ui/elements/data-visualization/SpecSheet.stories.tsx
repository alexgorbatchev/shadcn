import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { SpecSheet } from "../../../../assistant-ui/elements/SpecSheet.js";
const meta: Meta<typeof SpecSheet> = {
  component: SpecSheet,
  render: (args) => <SpecSheet {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/SpecSheet",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    title: "Workspace",
    subtitle: "Local environment",
    rows: [{ label: "Runtime", value: "Bun", emphasis: true }],
    visibleCount: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Runtime")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Bun")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
