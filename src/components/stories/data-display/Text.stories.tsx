import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Text } from "../../Text";

const meta: Meta<typeof Text> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Text",
  component: Text,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Text renders body copy as a paragraph with semantic `size` (xs, sm, base, lg), `tone` (default, muted, faint, primary, success, warning, destructive), `weight`, and `align`. `truncate` keeps one line with an ellipsis; otherwise long words wrap. `tabular` aligns digits. Use `render={<span />}` for inline text, or another element such as `<li />` or `<time />`.",
      },
    },
  },
  args: { children: "Members can continue any shared plan." },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "base", "lg"] },
    tone: { control: "select", options: ["default", "muted", "faint", "primary", "success", "warning", "destructive"] },
    weight: { control: "select", options: ["normal", "medium", "semibold"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Paragraph: Story = {
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText("Members can continue any shared plan.");
    await expect(text.localName).toBe("p");
  },
};

export const MutedSmall: Story = {
  args: { tone: "muted", size: "sm" },
  render: (args) => (
    <>
      <Text>Reference</Text>
      <Text {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const view = canvasElement.ownerDocument.defaultView!;
    const reference = view.getComputedStyle(within(canvasElement).getByText("Reference"));
    const muted = view.getComputedStyle(within(canvasElement).getByText(/Members can continue/));
    await expect(Number.parseFloat(muted.fontSize)).toBeLessThanOrEqual(Number.parseFloat(reference.fontSize));
    await expect(muted.color).not.toBe(reference.color);
  },
};

export const InlineSpan: Story = {
  args: { weight: "semibold", children: "Saved" },
  render: (args) => <Text {...args} render={<span />} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Saved").localName).toBe("span");
  },
};

export const Truncated: Story = {
  args: { truncate: true, children: "A remarkably long venue description that cannot fit in the narrow column" },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(/A remarkably long venue/);
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(text.getBoundingClientRect().height).toBeLessThan(30);
  },
};

export const WrappingLongWords: Story = {
  args: { children: "https://example.com/a/very/long/path/that/has/no/spaces/at/all" },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(/example\.com/);
    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
  },
};
