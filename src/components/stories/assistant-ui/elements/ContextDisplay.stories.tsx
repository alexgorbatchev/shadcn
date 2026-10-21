import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplay } from "../../../assistant-ui/elements/ContextDisplay.js";
const meta: Meta<typeof ContextDisplay> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ContextDisplay",
  component: ContextDisplay,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000, usage: { totalTokens: 9000 } },
  render: (args) => (
    <ContextDisplay {...args}>
      <ContextDisplay.Trigger aria-label="Context usage">Usage</ContextDisplay.Trigger>
      <ContextDisplay.Content />
    </ContextDisplay>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Context usage" }));
    await expect(await within(document.body).findByRole("dialog", { name: "Context usage" })).toHaveTextContent(
      "90% full",
    );
  },
};

export { Default as ContextDisplay };
