import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { ReasoningRoot } from "../../../../assistant-ui/elements/ReasoningRoot.js";
import { ReasoningTrigger } from "../../../../assistant-ui/elements/ReasoningTrigger.js";
import { ReasoningContent } from "../../../../assistant-ui/elements/ReasoningContent.js";
import { ReasoningText } from "../../../../assistant-ui/elements/ReasoningText.js";
const meta: Meta<typeof ReasoningContent> = {
  component: ReasoningContent,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/reasoning/ReasoningContent",
  render: (args) => (
    <ReasoningRoot defaultOpen>
      <ReasoningTrigger />
      <ReasoningContent {...args}>
        <ReasoningText>Inspect the package manifest</ReasoningText>
      </ReasoningContent>
    </ReasoningRoot>
  ),
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Inspect the package manifest")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "false");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
