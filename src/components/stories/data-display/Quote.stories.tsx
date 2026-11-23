import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Quote } from "../../Quote";

const meta: Meta<typeof Quote> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Quote",
  component: Quote,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Quote marks text quoted from elsewhere, such as the passage a comment targets or the message a reply answers, with a start rule that follows the reading direction. `size` is `default` for panels and composers and `compact` for message footers, bubbles and rows; `clamp` stops a long quote after two lines.",
      },
    },
  },
  args: { children: "Keep the sidebar compact and the toolbar visible." },
  argTypes: {
    size: { control: "select", options: ["default", "compact"] },
    clamp: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Quote>;

export const Default: Story = {
  args: { "aria-label": "Replying to" },
  play: async ({ canvasElement }) => {
    const quote = within(canvasElement).getByLabelText("Replying to");
    await expect(quote.tagName).toBe("BLOCKQUOTE");
    await expect(Number.parseFloat(getComputedStyle(quote).borderInlineStartWidth)).toBeGreaterThan(0);
  },
};

export const Compact: Story = {
  render: () => (
    <>
      <Quote aria-label="Default quote">Default size</Quote>
      <Quote aria-label="Compact quote" size="compact">
        Compact size
      </Quote>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const size = (label: string) => Number.parseFloat(getComputedStyle(canvas.getByLabelText(label)).fontSize);
    await expect(size("Compact quote")).toBeLessThan(size("Default quote"));
  },
};

export const Clamped: Story = {
  args: {
    clamp: true,
    "aria-label": "Clamped quote",
    children:
      "A long passage quoted from the page that goes on well past two lines in a narrow column, so the quote stops after two lines instead of pushing the comment it belongs to far down the panel.",
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const quote = within(canvasElement).getByLabelText("Clamped quote");
    await expect(quote.scrollHeight).toBeGreaterThan(quote.clientHeight);
  },
};

export const RightToLeft: Story = {
  args: { "aria-label": "RTL quote" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByLabelText("RTL quote"));
    await expect(Number.parseFloat(style.borderRightWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(style.borderLeftWidth)).toBe(0);
  },
};
