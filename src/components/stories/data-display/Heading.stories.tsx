import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Heading } from "../../Heading";

const meta: Meta<typeof Heading> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Heading",
  component: Heading,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Heading renders `h1`–`h6` from the required `level` so the document outline stays correct, while `size` (sm, base, lg, xl) sets the visual size independently. Sizes default by level: 1 xl, 2 lg, 3 base, 4–6 sm. `truncate` keeps one line.",
      },
    },
  },
  args: { level: 2, children: "Upcoming" },
  argTypes: {
    level: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    size: { control: "select", options: ["sm", "base", "lg", "xl"] },
  },
};
export default meta;
type Story = StoryObj<typeof Heading>;

export const Levels: Story = {
  render: () => (
    <>
      <Heading level={1}>Page</Heading>
      <Heading level={2}>Section</Heading>
      <Heading level={3}>Group</Heading>
      <Heading level={4}>Detail</Heading>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const view = canvasElement.ownerDocument.defaultView!;
    const sizes = ["Page", "Section", "Group", "Detail"].map((name, index) =>
      Number.parseFloat(view.getComputedStyle(canvas.getByRole("heading", { name, level: index + 1 })).fontSize),
    );
    await expect([...sizes].sort((a, b) => b - a)).toEqual(sizes);
    await expect(sizes[0]).toBeGreaterThan(sizes[3]!);
  },
};

export const SizeIndependentOfLevel: Story = {
  render: () => (
    <>
      <Heading level={1}>Default page</Heading>
      <Heading level={3} size="xl">
        Large group
      </Heading>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const view = canvasElement.ownerDocument.defaultView!;
    const page = view.getComputedStyle(canvas.getByRole("heading", { name: "Default page", level: 1 }));
    const group = view.getComputedStyle(canvas.getByRole("heading", { name: "Large group", level: 3 }));
    await expect(group.fontSize).toBe(page.fontSize);
  },
};

export const Truncated: Story = {
  args: { truncate: true, children: "A heading far too long to fit within the narrow column" },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole("heading", { level: 2 });
    await expect(heading.scrollWidth).toBeGreaterThan(heading.clientWidth);
  },
};
