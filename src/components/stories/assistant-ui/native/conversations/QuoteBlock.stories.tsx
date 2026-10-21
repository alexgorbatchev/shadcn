import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { QuoteBlock } from "../../../../assistant-ui/native/QuoteBlock.js";

const meta: Meta<typeof QuoteBlock> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/QuoteBlock",
  component: QuoteBlock,
  tags: ["autodocs", "test"],
  args: { text: "Selected content from the previous answer", messageId: "previous" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const QuotedText: Story = {
  play: async ({ canvasElement }) => {
    const quote = within(canvasElement).getByRole("blockquote");
    await expect(quote).toHaveTextContent("Selected content from the previous answer");
    await expect(quote).toBeVisible();
  },
};
