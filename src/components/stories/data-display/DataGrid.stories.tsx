import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { DataGrid, DataGridColumnHeader, DataGridFilter, dataGridFeatures } from "../../data-grid";
import { Checkbox } from "../../Checkbox";
import { Button } from "../../Button";
type Person = {
  id: string;
  name: string;
  email: string;
};
const people: Person[] = [
  { id: "1", name: "Zoe", email: "zoe@example.com" },
  { id: "2", name: "Alex", email: "alex@example.com" },
  { id: "3", name: "Kai", email: "kai@example.com" },
];
const helper = createColumnHelper<typeof dataGridFeatures, Person>();
const columns = helper.columns([
  helper.display({
    id: "select",
    header: "Select",
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
      />
    ),
  }),
  helper.accessor("name", {
    header: ({ column }) => <DataGridColumnHeader column={column}>Name</DataGridColumnHeader>,
    sortFn: "alphanumeric",
    filterFn: "includesString",
  }),
  helper.accessor("email", { header: "Email", enableSorting: false }),
]);
function Example({ loading = false, pagination = true }: { loading?: boolean; pagination?: boolean }) {
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: people,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  });
  return (
    <DataGrid
      table={table}
      label="People"
      loading={loading}
      pagination={pagination}
      toolbar={
        <div className="flex gap-2">
          <DataGridFilter table={table} columnId="name" label="Filter names" />
          <Button onClick={() => table.getColumn("email")?.toggleVisibility()}>Toggle email</Button>
        </div>
      }
    />
  );
}
const combinedColumns = helper.columns([
  helper.accessor("name", {
    header: ({ column, table }) => {
      const email = table.getColumn("email");
      return (
        <>
          <DataGridColumnHeader column={column}>Name</DataGridColumnHeader>
          {" / "}
          {email && <DataGridColumnHeader column={email}>Email</DataGridColumnHeader>}
        </>
      );
    },
    sortFn: "alphanumeric",
    meta: { sortColumnIds: ["email"] },
  }),
  helper.accessor("email", { header: "Email", sortFn: "alphanumeric" }),
]);
function CombinedSortExample() {
  const table = useTable({
    features: dataGridFeatures,
    columns: combinedColumns,
    data: people,
    getRowId: (row) => row.id,
    initialState: { columnVisibility: { email: false } },
  });
  return <DataGrid table={table} label="People" pagination={false} />;
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGrid",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Name" }));
    await expect(c.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "ascending");
    await expect(c.getAllByRole("row")[1]).toHaveTextContent("Alex");
    await userEvent.click(c.getByRole("checkbox", { name: "Select Alex" }));
    await expect(c.getByRole("status")).toHaveTextContent("1 selected");
    await userEvent.click(c.getByRole("button", { name: "Next" }));
    await expect(c.getByRole("status")).toHaveTextContent("Page 2 of 2");
    await expect(c.getByRole("table")).toHaveTextContent("Zoe");
    await userEvent.click(c.getByRole("button", { name: "Previous" }));
    await userEvent.click(c.getByRole("button", { name: "Name" }));
    await expect(c.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "descending");
    await userEvent.type(c.getByRole("textbox", { name: "Filter names" }), "Kai");
    await expect(c.getByRole("table")).toHaveTextContent("Kai");
    await expect(c.getByRole("table")).not.toHaveTextContent("Zoe");
    await userEvent.click(c.getByRole("button", { name: "Toggle email" }));
    await expect(c.queryByRole("columnheader", { name: "Email" })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole("combobox", { name: "Rows per page" }), "10");
    await userEvent.clear(c.getByRole("textbox"));
    await expect(c.getByRole("status")).toHaveTextContent("Page 1 of 1");
    await userEvent.type(c.getByRole("textbox"), "absent");
    await expect(c.getByRole("table")).toHaveTextContent("No results.");
  },
};
export const Loading: Story = {
  render: () => <Example loading />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Loading People…")).toHaveTextContent("Loading People");
  },
};
export const WithoutPagination: Story = {
  render: () => <Example pagination={false} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  },
};

export const CombinedSortHeader: Story = {
  render: () => <CombinedSortExample />,
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    const header = c.getByRole("columnheader", { name: "Name / Email" });
    await expect(header).toHaveAttribute("aria-sort", "none");
    // Sorting the hidden Email column through this header is announced on the header.
    await userEvent.click(within(header).getByRole("button", { name: "Email" }));
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(within(header).getByRole("button", { name: "Email" }));
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(within(header).getByRole("button", { name: "Name" }));
    await expect(header).toHaveAttribute("aria-sort", "ascending");
  },
};
