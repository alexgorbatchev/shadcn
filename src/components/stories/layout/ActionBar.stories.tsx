import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ActionBar, ActionBarRow } from "../../ActionBar";
import { Button } from "../../Button";

const meta: Meta<typeof ActionBar> = {
  title: "@alexgorbatchev/shadcn/components/layout/ActionBar",
  component: ActionBar,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof ActionBar>;

function Rows() {
  return (
    <>
      <ActionBarRow>
        <span>7 of 11 answered</span>
        <span className="text-muted-foreground">Saved 10:41</span>
      </ActionBarRow>
      <ActionBarRow justify="end">
        <Button type="button">I’m done</Button>
      </ActionBarRow>
    </>
  );
}

export const AtRest: Story = {
  args: { progress: 7 / 11, role: "region", "aria-label": "Hand back Round 1", children: <Rows /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("region", { name: "Hand back Round 1" });
    await expect(bar).not.toHaveAttribute("data-stuck");
    const meter = bar.querySelector<HTMLElement>('[data-slot="action-bar-meter"]');
    await expect(meter).toHaveAttribute("aria-hidden", "true");
    await expect(meter?.style.width).toBe("64%");
    const done = canvas.getByRole("button", { name: "I’m done" });
    await expect(done).toBeVisible();
    // justify="end" puts the action at the end of its row.
    await expect(Math.abs(done.getBoundingClientRect().right - bar.getBoundingClientRect().right)).toBeLessThan(2);
  },
};

export const OneRowWithoutWrapping: Story = {
  args: {
    children: (
      <ActionBarRow justify="between" align="end" wrap={false}>
        <span>7 of 11</span>
        <Button type="button">I’m done</Button>
      </ActionBarRow>
    ),
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>('[data-slot="action-bar-row"]')!;
    await expect(getComputedStyle(row).flexWrap).toBe("nowrap");
    await expect(getComputedStyle(row).alignItems).toBe("flex-end");
    await expect(getComputedStyle(row).justifyContent).toBe("space-between");
  },
};

/** `align="start"` keeps the action on the centre line of the first row when the status group beside it wraps. */
export const ActionOnFirstRowOfWrappedStatus: Story = {
  args: {
    children: (
      <ActionBarRow justify="between" align="start" wrap={false}>
        <div data-testid="status" className="flex w-40 flex-wrap items-center gap-2">
          <Button type="button" variant="outline">
            7 of 11
          </Button>
          <Button type="button" variant="outline">
            Next unanswered
          </Button>
        </div>
        <Button type="button">I’m done</Button>
      </ActionBarRow>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "7 of 11" }).getBoundingClientRect();
    const second = canvas.getByRole("button", { name: "Next unanswered" }).getBoundingClientRect();
    const done = canvas.getByRole("button", { name: "I’m done" }).getBoundingClientRect();
    // The status group wraps onto two rows, and the action shares the first row's centre line.
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
    await expect(Math.abs(done.top + done.height / 2 - (first.top + first.height / 2))).toBeLessThanOrEqual(1);
  },
};

export const StuckToTheBottom: Story = {
  args: { sticky: true, stuck: true, surface: "card", progress: 2, children: <Rows /> },
  decorators: [
    (Story) => (
      <div data-testid="scroller" className="h-48 overflow-auto bg-card" data-scroll="intentional">
        <div className="h-96">Content above the bar</div>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvas.getByTestId("scroller");
    const bar = scroller.querySelector<HTMLElement>('[data-slot="action-bar"]')!;
    await expect(bar).toHaveAttribute("data-stuck", "true");
    await expect(bar.querySelector<HTMLElement>('[data-slot="action-bar-meter"]')?.style.width).toBe("100%");
    // Sticky: the bar sits at the bottom of the visible area while the content continues below.
    const scrollerBounds = scroller.getBoundingClientRect();
    await expect(Math.abs(bar.getBoundingClientRect().bottom - scrollerBounds.bottom)).toBeLessThan(2);
  },
};

export const WithoutMeter: Story = {
  args: { progress: undefined, children: <Rows /> },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="action-bar-meter"]')).toBeNull();
  },
};
