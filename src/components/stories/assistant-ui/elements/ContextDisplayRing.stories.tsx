import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayRing } from "../../../assistant-ui/elements/ContextDisplayRing.js";
const meta: Meta<typeof ContextDisplayRing> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ContextDisplayRing",
  component: ContextDisplayRing,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000, usage: { totalTokens: 7500 } },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Context usage" });
    await expect(trigger).toHaveTextContent("75%");
    await userEvent.hover(trigger);
    const tooltip = await within(document.body).findByRole("dialog", { name: "Context usage" });
    await expect(within(tooltip).getByRole("meter", { name: "Context window used" })).toHaveAttribute("value", "75");
  },
};

export { Default as ContextDisplayRing };
