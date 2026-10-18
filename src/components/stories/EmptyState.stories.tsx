import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { EmptyState } from "../EmptyState";
import { Button } from "../Button";

const meta: Meta<typeof EmptyState> = {
  title: "shadcn-alexgorbatchev/components/EmptyState",
  component: EmptyState,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { title: "No tracks", description: "Add music to begin." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No tracks")).toBeVisible();
    await expect(within(canvasElement).getByText("Add music to begin.")).toBeVisible();
  },
};
export const WithAction: Story = {
  args: { ...Default.args, children: <Button>Add music</Button> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Add music" })).toBeVisible();
  },
};
