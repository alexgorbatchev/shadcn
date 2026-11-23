import type { Meta, StoryObj } from "@storybook/react-vite";
import { BellIcon } from "lucide-react";
import { expect, within } from "storybook/test";
import { Button } from "../../Button";
import { StatusDot } from "../../StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "@alexgorbatchev/shadcn/components/data-display/StatusDot",
  component: StatusDot,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'StatusDot marks something new or waiting with a small SVG dot in `currentColor`, so forced colors keep it. `tone` is `primary` for new or waiting and `muted` for quieter states; `count` adds a number; `placement="corner"` pins it to the top end corner of a positioned parent such as an icon button. It is hidden from assistive technology, so say what it means in nearby text or the control\'s name.',
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["primary", "muted"] },
    placement: { control: "select", options: ["inline", "corner"] },
  },
};
export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Inline: Story = {
  render: (args) => (
    <p className="flex items-center gap-2 text-sm">
      <StatusDot {...args} />
      Needs your answers
    </p>
  ),
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector("[data-slot='status-dot']");
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    await expect(dot).toHaveAttribute("data-tone", "primary");
    await expect(dot?.querySelector("circle")).toHaveAttribute("fill", "currentColor");
    await expect(within(canvasElement).getByText("Needs your answers")).toBeVisible();
  },
};

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-sm">
      <StatusDot data-testid="primary" />
      <StatusDot data-testid="muted" tone="muted" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByTestId("primary")).color).not.toBe(
      getComputedStyle(canvas.getByTestId("muted")).color,
    );
  },
};

export const WithCount: Story = {
  args: { count: 3 },
  play: async ({ canvasElement }) => {
    const count = canvasElement.querySelector("[data-slot='status-dot'] [data-slot='status-dot-count']");
    await expect(count).toHaveTextContent("3");
  },
};

export const Corner: Story = {
  render: () => (
    <Button variant="outline" size="icon" aria-label="Notifications, unread" className="relative">
      <BellIcon aria-hidden="true" />
      <StatusDot placement="corner" />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Notifications, unread" });
    const dot = button.querySelector("[data-slot='status-dot']")!;
    const buttonBox = button.getBoundingClientRect();
    const dotBox = dot.getBoundingClientRect();
    // The dot sits on the button's top end corner and does not take pointer input.
    await expect(getComputedStyle(dot).position).toBe("absolute");
    await expect(getComputedStyle(dot).pointerEvents).toBe("none");
    await expect(dotBox.top).toBeLessThan(buttonBox.top + dotBox.height);
    await expect(dotBox.right).toBeGreaterThan(buttonBox.right - dotBox.width);
  },
};
