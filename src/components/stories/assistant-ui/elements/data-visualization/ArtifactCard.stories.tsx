import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ArtifactCard } from "../../../../assistant-ui/elements/ArtifactCard.js";
const meta: Meta<typeof ArtifactCard> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/ArtifactCard",
  component: ArtifactCard,
  tags: ["autodocs", "test"],
  args: { title: "Review report", meta: "Markdown · 4 KB", onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Open: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: /Review report/ });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Generating: Story = {
  args: { generating: true, words: 58 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("58 words")).toBeVisible();
    await expect(canvas.queryByText("Markdown · 4 KB")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { onClick: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /Review report/ })).toBeDisabled();
  },
};
