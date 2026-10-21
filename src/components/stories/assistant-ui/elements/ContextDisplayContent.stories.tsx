import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayContent } from "../../../assistant-ui/elements/ContextDisplayContent.js";
import { ContextDisplayRoot } from "../../../assistant-ui/elements/ContextDisplayRoot.js";
import { ContextDisplayTrigger } from "../../../assistant-ui/elements/ContextDisplayTrigger.js";
const meta: Meta<typeof ContextDisplayContent> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ContextDisplayContent",
  component: ContextDisplayContent,
  tags: ["autodocs", "test"],
  render: (args) => (
    <ContextDisplayRoot modelContextWindow={10000} usage={{ totalTokens: 0 }}>
      <ContextDisplayTrigger aria-label="Context usage">Usage</ContextDisplayTrigger>
      <ContextDisplayContent {...args} />
    </ContextDisplayRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Context usage" }));
    const tooltip = await within(document.body).findByRole("dialog", { name: "Context usage" });
    await expect(tooltip).toHaveTextContent("0% full");
    await expect(within(tooltip).getByRole("meter", { name: "Context window used" })).toHaveAttribute("value", "0");
    await expect(within(tooltip).queryByText("Input")).not.toBeInTheDocument();
  },
};

export { Default as ContextDisplayContent };
