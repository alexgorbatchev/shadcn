import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Card, CardContent, CardHeader, CardTitle } from "../../Card";
import { Field, FieldLabel } from "../../Field";
import { Grid, GridItem } from "../../Grid";
import { Input } from "../../Input";
import { Textarea } from "../../Textarea";

function rowsOf(elements: readonly Element[]): number[][] {
  const rows = new Map<number, number[]>();
  elements.forEach((element, index) => {
    const top = Math.round(element.getBoundingClientRect().top);
    rows.set(top, [...(rows.get(top) ?? []), index]);
  });
  return [...rows.values()];
}

const meta: Meta<typeof Grid> = {
  title: "@alexgorbatchev/shadcn/components/layout/Grid",
  component: Grid,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Grid lays out equal columns without consumer classes. `columns` is 1–6 or 12, or a viewport breakpoint map such as `{ base: 1, md: 2, xl: 4 }`. `minColumnWidth` (xs 8rem, sm 12rem, md 16rem, lg 22rem) instead fits as many columns as the grid's own width allows, which suits card grids inside panes of any size. `gap` defaults to the density-aware `panel` token. GridItem `span` (1–6 or `full`, optionally per breakpoint) widens a cell; `full` always spans every column. Both accept `render` for semantic elements such as `<ul />` and `<li />`.",
      },
    },
  },
  args: { columns: 2 },
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4, 5, 6, 12] },
    gap: { control: "select", options: ["none", "control", "panel-sm", "panel", "field", "section"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
  },
  render: (args) => (
    <Grid {...args} render={<ul aria-label="Venues" />}>
      {["Harbor walk", "Night market", "Rooftop bar", "Botanical garden"].map((venue) => (
        <GridItem key={venue} render={<li />}>
          <Card>
            <CardHeader>
              <CardTitle>{venue}</CardTitle>
            </CardHeader>
            <CardContent>Open until late.</CardContent>
          </Card>
        </GridItem>
      ))}
    </Grid>
  ),
};
export default meta;
type Story = StoryObj<typeof Grid>;

export const Columns: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Venues" });
    const items = within(list).getAllByRole("listitem");
    await expect(rowsOf(items)).toEqual([
      [0, 1],
      [2, 3],
    ]);
    const [first, second] = items.map((item) => item.getBoundingClientRect());
    const panelSpacing = Number.parseFloat(getComputedStyle(list).getPropertyValue("--ag-panel-padding"));
    await expect(second!.left - first!.right).toBeCloseTo(panelSpacing, 0);
  },
};

export const ResponsiveColumns: Story = {
  args: { columns: { base: 1, md: 2 } },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole("listitem");
    const isWide = canvasElement.ownerDocument.defaultView!.matchMedia("(min-width: 48rem)").matches;
    await expect(rowsOf(items)).toHaveLength(isWide ? 2 : 4);
  },
};

export const IntrinsicColumns: Story = {
  args: { columns: undefined, minColumnWidth: "sm" },
  decorators: [
    (Story) => (
      <div className="w-[440px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole("listitem");
    await expect(rowsOf(items)).toEqual([
      [0, 1],
      [2, 3],
    ]);
    for (const item of items) await expect(item.getBoundingClientRect().width).toBeGreaterThanOrEqual(192);
  },
};

export const IntrinsicColumnsInNarrowPane: Story = {
  ...IntrinsicColumns,
  decorators: [
    (Story) => (
      <div className="w-[160px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list");
    const items = within(list).getAllByRole("listitem");
    await expect(rowsOf(items)).toHaveLength(4);
    for (const item of items) {
      await expect(item.getBoundingClientRect().width).toBeCloseTo(list.getBoundingClientRect().width, 0);
    }
  },
};

export const TwoColumnForm: Story = {
  args: { columns: 2, gap: "field" },
  render: (args) => (
    <Grid {...args} render={<form aria-label="Contact" />}>
      <Field>
        <FieldLabel htmlFor="grid-first-name">First name</FieldLabel>
        <Input id="grid-first-name" />
      </Field>
      <Field>
        <FieldLabel htmlFor="grid-last-name">Last name</FieldLabel>
        <Input id="grid-last-name" />
      </Field>
      <GridItem span="full">
        <Field>
          <FieldLabel htmlFor="grid-notes">Notes</FieldLabel>
          <Textarea id="grid-notes" />
        </Field>
      </GridItem>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Contact" }).getBoundingClientRect();
    const first = canvas.getByRole("textbox", { name: "First name" }).getBoundingClientRect();
    const last = canvas.getByRole("textbox", { name: "Last name" }).getBoundingClientRect();
    const notes = canvas.getByRole("textbox", { name: "Notes" }).getBoundingClientRect();
    await expect(first.top).toBeCloseTo(last.top, 0);
    await expect(notes.top).toBeGreaterThan(first.bottom);
    await expect(notes.width).toBeCloseTo(form.width, 0);
  },
};

export const ResponsiveSpan: Story = {
  args: { columns: 4, gap: "control" },
  render: (args) => (
    <Grid {...args}>
      <GridItem span={{ base: 2, md: 4 }} render={<section aria-label="Wide" />}>
        Wide
      </GridItem>
      <GridItem render={<section aria-label="Narrow" />}>Narrow</GridItem>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wide = canvas.getByRole("region", { name: "Wide" }).getBoundingClientRect();
    const narrow = canvas.getByRole("region", { name: "Narrow" }).getBoundingClientRect();
    const isWide = canvasElement.ownerDocument.defaultView!.matchMedia("(min-width: 48rem)").matches;
    await expect(narrow.top > wide.top).toBe(isWide);
    await expect(wide.width / narrow.width).toBeGreaterThan(isWide ? 4 : 2);
  },
};
