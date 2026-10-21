import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ContextDisplayValue } from "../../../../assistant-ui/elements/ContextDisplayValue.js";
import { ContextDisplayRoot } from "../../../../assistant-ui/elements/ContextDisplayRoot.js";
const meta: Meta<typeof ContextDisplayValue> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/context/ContextDisplayValue",
  component: ContextDisplayValue,
  tags: ["autodocs", "test"],
  args: { variant: "text" },
  render: (args) => (
    <ContextDisplayRoot modelContextWindow={10000} usage={{ totalTokens: 7500 }}>
      <ContextDisplayValue {...args} />
    </ContextDisplayRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("7.5k / 10k")).toBeVisible();
  },
};
export const Ring: Story = {
  args: { variant: "ring" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("75%")).toBeVisible();
  },
};
export const Bar: Story = {
  args: { variant: "bar" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("meter", { name: "Context window used" })).toHaveAttribute(
      "value",
      "75",
    );
    await expect(within(canvasElement).getByText("7.5k (75%)")).toBeVisible();
  },
};
