import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Composer } from "../../../../assistant-ui/elements/Composer.js";
import { ComposerInput } from "../../../../assistant-ui/elements/ComposerInput.js";
import { ComposerMenu } from "../../../../assistant-ui/elements/ComposerMenu.js";
import { ComposerMenuItem } from "../../../../assistant-ui/elements/ComposerMenuItem.js";
const meta: Meta<typeof ComposerMenu> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerMenu",
  component: ComposerMenu,
  tags: ["autodocs", "test"],
  args: { open: true, children: <ComposerMenuItem>Review change</ComposerMenuItem>, onClick: fn() },
  render: (args) => (
    <Composer>
      <ComposerMenu {...args} />
      <ComposerInput aria-label="Message" />
    </Composer>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Open: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole("button", { name: "Review change" });
    await waitFor(() => expect(item).toBeVisible());
    await userEvent.click(item);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Review change")).not.toBeVisible());
    await userEvent.click(canvas.getByRole("textbox", { name: "Message" }));
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByText("Review change")).not.toHaveFocus();
  },
};
export const EndAligned: Story = {
  args: { align: "end" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Review change" })).toBeVisible());
    const bounds = canvas.getByTestId("Composer").getBoundingClientRect();
    const menu = canvas.getByTestId("ComposerMenu").getBoundingClientRect();
    await expect(menu.left).toBeGreaterThanOrEqual(bounds.left - 1);
    await expect(menu.right).toBeLessThanOrEqual(bounds.right + 1);
  },
};
