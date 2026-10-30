import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { Heading } from "../../Heading";
import { ScrollArea } from "../../ScrollArea";
import { Stack } from "../../Stack";
import { Text } from "../../Text";

const submitForm = fn((event: { preventDefault: () => void }) => event.preventDefault());

function gapBetween(first: Element, second: Element, axis: "x" | "y"): number {
  const a = first.getBoundingClientRect();
  const b = second.getBoundingClientRect();
  return axis === "y" ? b.top - a.bottom : b.left - a.right;
}

const meta: Meta<typeof Stack> = {
  title: "@alexgorbatchev/shadcn/components/layout/Stack",
  component: Stack,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Stack arranges children along one axis without consumer classes. `gap` and `padding` accept the density-aware tokens none, control, panel-sm, panel, field, and section. `direction` is vertical or horizontal, or a breakpoint map such as `{ base: "vertical", md: "horizontal" }`. `align` and `justify` position children; `wrap` lets a row wrap. `grow` takes the remaining space of a parent Stack and lets content shrink, and `height` is auto, full (the parent\'s height), viewport, or min-viewport. Pass `render={<section />}`, `<ul />`, `<li />`, `<form />`, or `<main />` for semantic elements; props, handlers, and refs merge.',
      },
    },
  },
  args: { gap: "panel" },
  argTypes: {
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    gap: { control: "select", options: ["none", "control", "panel-sm", "panel", "field", "section"] },
    padding: { control: "select", options: ["none", "control", "panel-sm", "panel", "field", "section"] },
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: { control: "select", options: ["start", "center", "end", "between"] },
    height: { control: "select", options: ["auto", "full", "viewport", "min-viewport"] },
  },
  render: (args) => (
    <Stack {...args} render={<section aria-label="Profile" />}>
      <Heading level={2}>Profile</Heading>
      <Text tone="muted">Shown to everyone in the workspace.</Text>
      <Text>Members see your name and avatar.</Text>
    </Stack>
  ),
};
export default meta;
type Story = StoryObj<typeof Stack>;

export const Vertical: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Profile" });
    const [heading, description] = [
      within(section).getByRole("heading", { name: "Profile", level: 2 }),
      within(section).getByText("Shown to everyone in the workspace."),
    ];
    await expect(section.localName).toBe("section");
    const panelSpacing = Number.parseFloat(getComputedStyle(section).getPropertyValue("--ag-panel-padding"));
    await expect(gapBetween(heading, description, "y")).toBeCloseTo(panelSpacing, 0);
  },
};

export const CompactDensity: Story = {
  args: { density: "compact" },
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Profile" });
    await expect(
      gapBetween(within(section).getByRole("heading"), within(section).getByText(/Shown to everyone/), "y"),
    ).toBeCloseTo(8, 0);
  },
};

export const HeaderWithTrailingActions: Story = {
  args: { direction: "horizontal", justify: "between", align: "center", gap: "control", wrap: true },
  render: (args) => (
    <Stack {...args} render={<section aria-label="Section header" />}>
      <Heading level={2}>Members</Heading>
      <Stack direction="horizontal" gap="control">
        <Button variant="outline">Export</Button>
        <Button>Invite</Button>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const header = within(canvasElement).getByRole("region", { name: "Section header" });
    const heading = within(header).getByRole("heading", { name: "Members" });
    const invite = within(header).getByRole("button", { name: "Invite" });
    const bounds = header.getBoundingClientRect();
    await expect(heading.getBoundingClientRect().left).toBeCloseTo(bounds.left, 0);
    await expect(invite.getBoundingClientRect().right).toBeCloseTo(bounds.right, 0);
    const center = (rect: DOMRect): number => rect.top + rect.height / 2;
    await expect(center(heading.getBoundingClientRect())).toBeCloseTo(center(invite.getBoundingClientRect()), 0);
  },
};

export const Wrapping: Story = {
  args: { direction: "horizontal", gap: "control", wrap: true },
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Stack {...args} render={<ul aria-label="Interests" />}>
      {["Museums", "Live music", "Hiking", "Street food", "Cinema"].map((interest) => (
        <Stack key={interest} render={<li />}>
          <Badge variant="secondary">{interest}</Badge>
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Interests" });
    const items = within(list).getAllByRole("listitem");
    await expect(items).toHaveLength(5);
    const rows = new Set(items.map((item) => Math.round(item.getBoundingClientRect().top)));
    await expect(rows.size).toBeGreaterThan(1);
    for (const item of items) {
      await expect(item.getBoundingClientRect().right).toBeLessThanOrEqual(list.getBoundingClientRect().right + 1);
    }
  },
};

export const ResponsiveDirection: Story = {
  args: { direction: { base: "vertical", md: "horizontal" } },
  render: (args) => (
    <Stack {...args}>
      <Text>First</Text>
      <Text>Second</Text>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("First").getBoundingClientRect();
    const second = canvas.getByText("Second").getBoundingClientRect();
    const isWide = canvasElement.ownerDocument.defaultView!.matchMedia("(min-width: 48rem)").matches;
    await expect(second.top === first.top).toBe(isWide);
    await expect(second.left > first.left).toBe(isWide);
  },
};

export const FullHeightRegion: Story = {
  args: { height: "full", gap: "none" },
  decorators: [
    (Story) => (
      <div className="h-60 w-72 border border-border" data-scroll="none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Stack {...args}>
      <Stack padding="panel-sm">
        <Heading level={2}>Activity</Heading>
      </Stack>
      <ScrollArea grow aria-label="Activity log">
        <Stack padding="panel-sm" gap="control" render={<ol />}>
          {Array.from({ length: 30 }, (_, index) => (
            <Text key={index} render={<li />}>
              Update {index + 1}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
      <Stack padding="panel-sm" direction="horizontal" justify="end">
        <Button>Refresh</Button>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector("[data-scroll=none]")!.getBoundingClientRect();
    const refresh = canvas.getByRole("button", { name: "Refresh" });
    await expect(refresh.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.bottom);
    await expect(refresh.getBoundingClientRect().bottom).toBeGreaterThan(frame.bottom - 60);
    const viewport = canvasElement.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() =>
      expect(canvas.getByText("Update 30").getBoundingClientRect().bottom).toBeLessThan(frame.bottom),
    );
  },
};

export const GrowingPane: Story = {
  args: { direction: "horizontal", gap: "panel", height: "full" },
  decorators: [
    (Story) => (
      <div className="h-24 w-96">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Stack {...args}>
      <Text>Fixed</Text>
      <Stack grow padding="control" render={<section aria-label="Remaining space" />}>
        <Text truncate>A very long description that must shrink to the remaining width instead of overflowing</Text>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const pane = within(canvasElement).getByRole("region", { name: "Remaining space" });
    const container = pane.parentElement!.getBoundingClientRect();
    await expect(pane.getBoundingClientRect().right).toBeCloseTo(container.right, 0);
    await expect(pane.getBoundingClientRect().height).toBeCloseTo(container.height, 0);
    await expect(pane.scrollWidth).toBeLessThanOrEqual(pane.clientWidth);
  },
};

export const FormElement: Story = {
  render: (args) => (
    <Stack {...args} render={<form aria-label="Rename" onSubmit={submitForm} />}>
      <Text>Rename the workspace.</Text>
      <Button type="submit">Save</Button>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const form = within(canvasElement).getByRole("form", { name: "Rename" });
    await userEvent.click(within(form).getByRole("button", { name: "Save" }));
    await expect(submitForm).toHaveBeenCalledOnce();
  },
};
