import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VirtualTable } from "../virtual-table/VirtualTable.js";
import { TableCell, TableHead, TableRow } from "../Table.js";
import { Button } from "../Button.js";
import { fixture_virtualRows } from "./fixtures";

const meta: Meta<typeof VirtualTable<string>> = {
  title: "shadcn-alexgorbatchev/components/VirtualTable",
  component: VirtualTable,
  tags: ["autodocs", "test"],
  args: {
    items: fixture_virtualRows,
    getItemKey: (item) => item,
    label: "Items",
    maxHeight: 300,
    columnCount: 1,
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
