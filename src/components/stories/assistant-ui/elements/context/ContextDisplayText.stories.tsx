import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayText } from "../../../../assistant-ui/elements/ContextDisplayText.js";
const meta: Meta<typeof ContextDisplayText> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/context/ContextDisplayText",
  component: ContextDisplayText,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000, usage: { totalTokens: 7500 } },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Context usage" });
    await expect(trigger).toHaveTextContent("7.5k / 10k");
    await userEvent.hover(trigger);
    const tooltip = await within(document.body).findByRole("dialog", { name: "Context usage" });
    await expect(within(tooltip).getByRole("meter", { name: "Context window used" })).toHaveAttribute("value", "75");
  },
};

export { Default as ContextDisplayText };
