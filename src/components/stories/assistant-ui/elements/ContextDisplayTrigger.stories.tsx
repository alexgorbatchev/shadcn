import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ContextDisplayTrigger } from "../../../assistant-ui/elements/ContextDisplayTrigger.js";
import { ContextDisplayRoot } from "../../../assistant-ui/elements/ContextDisplayRoot.js";
import { ContextDisplayContent } from "../../../assistant-ui/elements/ContextDisplayContent.js";
const meta: Meta<typeof ContextDisplayTrigger> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ContextDisplayTrigger",
  component: ContextDisplayTrigger,
  tags: ["autodocs", "test"],
  args: { children: "Usage" },
  render: (args) => (
    <ContextDisplayRoot modelContextWindow={10000} usage={{ totalTokens: 7500 }}>
      <ContextDisplayTrigger {...args} />
      <ContextDisplayContent />
    </ContextDisplayRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", { name: "Usage" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(await within(document.body).findByRole("dialog", { name: "Context usage" })).toHaveTextContent(
      "75% full",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog", { name: "Context usage" })).not.toBeInTheDocument(),
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Usage" })).toBeDisabled();
  },
};
