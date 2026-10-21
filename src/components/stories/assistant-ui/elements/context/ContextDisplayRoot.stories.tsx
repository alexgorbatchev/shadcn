import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayRoot } from "../../../../assistant-ui/elements/ContextDisplayRoot.js";
import { ContextDisplayTrigger } from "../../../../assistant-ui/elements/ContextDisplayTrigger.js";
import { ContextDisplayContent } from "../../../../assistant-ui/elements/ContextDisplayContent.js";

const meta: Meta<typeof ContextDisplayRoot> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/context/ContextDisplayRoot",
  component: ContextDisplayRoot,
  tags: ["autodocs", "test"],
  args: {
    modelContextWindow: 10000,
    usage: { totalTokens: 7500, inputTokens: 6000, cachedInputTokens: 4000, outputTokens: 1500 },
  },
  render: (args) => (
    <ContextDisplayRoot {...args}>
      <ContextDisplayTrigger aria-label="Context usage">Usage</ContextDisplayTrigger>
      <ContextDisplayContent />
    </ContextDisplayRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Usage: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Context usage" }));
    const tooltip = await within(document.body).findByRole("dialog", { name: "Context usage" });
    await expect(tooltip).toHaveTextContent("75% full");
    const meter = within(tooltip).getByRole("meter", { name: "Context window used" });
    await expect(meter).toHaveAttribute("value", "75");
    await expect(tooltip).toHaveTextContent("Cached input");
  },
};
export const NoUsage: Story = {
  args: { usage: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
