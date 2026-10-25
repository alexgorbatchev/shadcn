import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VirtualTable } from "../../virtual-table/VirtualTable.js";
import { TableCell, TableColumn, TableColumnGroup, TableHead, TableRow } from "../../Table.js";
import { Button } from "../../Button.js";
import { fixture_virtualRows } from "../fixtures";

const meta: Meta<typeof VirtualTable<string>> = {
  title: "@alexgorbatchev/shadcn/components/data-display/VirtualTable",
  component: VirtualTable,
  tags: ["autodocs", "test"],
  args: {
    items: fixture_virtualRows,
    getItemKey: (item) => item,
    label: "Items",
    maxHeight: 300,
    header: (
      <TableRow>
        <TableHead scope="col">Name</TableHead>
      </TableRow>
    ),
    renderRow: (item, props) => (
      <TableRow {...props}>
        <TableCell>
          <Button>{item}</Button>
        </TableCell>
      </TableRow>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof VirtualTable<string>>;

export const LargeCollection: Story = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Item 0" })).toBeVisible();
    await expect(canvas.getByRole("table", { name: "Items" })).toHaveAttribute("aria-rowcount", "1001");
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
    const viewport = canvas.getByRole("region", { name: "Items" });
    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => expect(canvas.getByRole("button", { name: "Item 999" })).toBeVisible());
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
    viewport.scrollTo({ top: 0 });
    await waitFor(() => expect(canvas.getByRole("button", { name: "Item 0" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Item 0" }));
    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => expect(canvas.getByRole("button", { name: "Item 999" })).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Item 0" })).toHaveFocus();
  },
};

export const RetainedRow: Story = {
  args: { retainedKeys: ["Item 500"] },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Item 0" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Item 500" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
  },
};

export const ResponsiveColumns: Story = {
  args: {
    columns: (
      <TableColumnGroup>
        <TableColumn />
        <TableColumn visibleFrom="container-sm" style={{ width: 80 }} />
        <TableColumn style={{ width: 60 }} />
      </TableColumnGroup>
    ),
    header: (
      <TableRow>
        <TableHead scope="col">Name</TableHead>
        <TableHead scope="col" visibleFrom="container-sm">
          Kind
        </TableHead>
        <TableHead scope="col">Size</TableHead>
      </TableRow>
    ),
    renderRow: (item, props) => (
      <TableRow {...props}>
        <TableCell>{item}</TableCell>
        <TableCell visibleFrom="container-sm">File</TableCell>
        <TableCell>1 KB</TableCell>
      </TableRow>
    ),
  },
  render: (args) => (
    <div style={{ width: 350 }}>
      <VirtualTable {...args} />
    </div>
  ),
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const table = await canvas.findByRole("table", { name: "Items" });
    const viewport = canvas.getByRole("region", { name: "Items" });
    viewport.scrollTo({ top: viewport.scrollHeight / 2 });
    // Spacer rows above and below the rendered rows add no columns for the hidden Kind cells to leave empty.
    await waitFor(() => expect(canvas.queryByRole("cell", { name: "Item 0" })).not.toBeInTheDocument());
    await expect(canvas.getByText("Kind", { exact: true })).not.toBeVisible();
    const name = canvas.getByRole("columnheader", { name: "Name" }).getBoundingClientRect().width;
    await expect(name).toBe(table.getBoundingClientRect().width - 60);
  },
};
