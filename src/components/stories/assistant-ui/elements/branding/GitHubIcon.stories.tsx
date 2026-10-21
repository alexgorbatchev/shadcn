import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { Button } from "../../../../Button.js";
import { GitHubIcon } from "../../../../assistant-ui/elements/GitHubIcon.js";
const meta: Meta<typeof GitHubIcon> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/branding/GitHubIcon",
  component: GitHubIcon,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByTestId("GitHubIcon")).toBeVisible());
  },
};
const open = fn();
export const Tile: Story = {
  args: { variant: "tile" },
  render: (args) => (
    <Button onClick={open}>
      <GitHubIcon {...args} />
      Open repository
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("GitHubIcon")).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Open repository" }));
    await expect(open).toHaveBeenCalledTimes(1);
  },
};
