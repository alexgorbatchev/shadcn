import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ComposerContext } from "../../../../assistant-ui/elements/ComposerContext.js";
import { fixture_composerUsage } from "../fixtures.js";
const meta: Meta<typeof ComposerContext> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerContext",
  component: ComposerContext,
  tags: ["autodocs", "test"],
  args: { usage: fixture_composerUsage },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Usage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Context usage: 25%" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const tooltip = await page.findByRole("dialog", { name: "Context usage" });
    await expect(within(tooltip).getByRole("meter", { name: "System context usage" })).toHaveAttribute(
      "aria-valuetext",
      "4,000 of 64,000",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", { name: "Context usage" })).not.toBeInTheDocument());
  },
};
export const NearCapacity: Story = {
  args: { usage: { system: 4, tools: 2, messages: 54, total: 64 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Context usage: 93.8%" })).toBeVisible();
    await userEvent.hover(canvas.getByRole("button", { name: "Context usage: 93.8%" }));
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Context usage" }),
    ).toHaveTextContent("60,000 / 64,000");
  },
};
export const Empty: Story = {
  args: { usage: { system: 0, tools: 0, messages: 0, total: 0 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Context usage: 0%" })).toBeVisible();
    await userEvent.hover(canvas.getByRole("button", { name: "Context usage: 0%" }));
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Context usage" });
    await expect(within(tooltip).queryByRole("meter")).not.toBeInTheDocument();
  },
};
