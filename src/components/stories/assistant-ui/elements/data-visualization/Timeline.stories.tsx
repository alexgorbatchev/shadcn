import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Badge } from "../../../../Badge.js";
import { Button } from "../../../../Button.js";
import { Timeline } from "../../../../assistant-ui/elements/Timeline.js";

const removeStop = fn();

const meta: Meta<typeof Timeline> = {
  component: Timeline,
  render: (args) => <Timeline {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/Timeline",
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Timeline renders events as an ordered list. Each event has an `id`, a `title`, and optional `time`, `detail`, `meta` (such as badges), `actions` (such as a menu button), and `connector`, an annotation for the segment to the next visible event, such as travel time. `when` marks past, now (announced as the current step), or future progress; omit it for neutral entries. `visibleCount` reveals only the leading events and defaults to all of them. `fullWidth` spans the container instead of the compact card width. The time column is omitted when no visible event has a time.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [
      { id: "one", when: "past", time: "09:00", title: "Analysis started" },
      { id: "two", when: "now", time: "09:01", title: "Reviewing results", detail: "Three files changed" },
      { id: "three", when: "future", time: "09:05", title: "Publish report" },
    ],
    visibleCount: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    await expect(list.localName).toBe("ol");
    await expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    await waitFor(() => expect(canvas.getByText("Analysis started")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Three files changed")).toBeVisible());
    await expect(canvas.getByText("Reviewing results").closest("li")).toHaveAttribute("aria-current", "step");
    await expect(canvas.queryByText("Publish report")).not.toBeInTheDocument();
  },
};

export const AllEventsByDefault: Story = {
  args: { ...Default.args, visibleCount: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("listitem")).toHaveLength(3);
    await waitFor(() => expect(within(canvasElement).getByText("Publish report")).toBeVisible());
  },
};

export const Itinerary: Story = {
  args: {
    fullWidth: true,
    "aria-label": "Itinerary",
    events: [
      {
        id: "coffee",
        time: "10:00",
        title: "Coffee at the corner café",
        detail: "45 min · about $12",
        meta: <Badge variant="secondary">Locked</Badge>,
        actions: (
          <Button variant="ghost" size="sm" onClick={() => removeStop("coffee")}>
            Remove
          </Button>
        ),
        connector: "12 min walk · 0.8 km",
      },
      {
        id: "museum",
        time: "11:00",
        title: "Modern art museum",
        detail: "2 h",
        connector: "Unused after the last event",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Itinerary" });
    await expect(list.getBoundingClientRect().width).toBeCloseTo(600, 0);
    const [first, last] = within(list).getAllByRole("listitem");
    await waitFor(() => expect(within(first!).getByText("Locked")).toBeVisible());
    await waitFor(() => expect(within(first!).getByText("12 min walk · 0.8 km")).toBeVisible());
    await expect(within(last!).queryByText("Unused after the last event")).not.toBeInTheDocument();
    const connector = within(first!).getByText("12 min walk · 0.8 km").getBoundingClientRect();
    await expect(connector.bottom).toBeLessThanOrEqual(
      within(last!).getByText("Modern art museum").getBoundingClientRect().top,
    );
    await userEvent.click(within(first!).getByRole("button", { name: "Remove" }));
    await expect(removeStop).toHaveBeenCalledWith("coffee");
    const remove = within(first!).getByRole("button", { name: "Remove" }).getBoundingClientRect();
    const title = within(first!).getByText("Coffee at the corner café").getBoundingClientRect();
    await expect(remove.left).toBeGreaterThan(title.right);
    await expect(list.getBoundingClientRect().right - remove.right).toBeLessThan(24);
  },
};

export const AlignedTimes: Story = {
  args: {
    events: [
      { id: "early", time: "9:00 AM", title: "Breakfast" },
      { id: "late", time: "10:30 PM", title: "Late show" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const early = canvas.getByText("Breakfast").getBoundingClientRect();
    const late = canvas.getByText("Late show").getBoundingClientRect();
    await expect(early.left).toBeCloseTo(late.left, 0);
    const time = canvas.getByText("10:30 PM");
    await expect(time.scrollWidth).toBeLessThanOrEqual(time.clientWidth);
  },
};

export const WithoutTimes: Story = {
  args: {
    events: [
      { id: "idea", title: "Picnic in the park" },
      { id: "other", title: "Board game café" },
    ],
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list");
    const title = within(list).getByText("Picnic in the park").getBoundingClientRect();
    await expect(title.left - list.getBoundingClientRect().left).toBeLessThan(48);
  },
};

export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
