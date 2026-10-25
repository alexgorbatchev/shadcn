import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useId, useRef, useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../Dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "../../DropdownMenu";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Table";
import { Button } from "../../Button";
import { DirectionProvider } from "../../DirectionProvider";
import { Checkbox } from "../../Checkbox";
import { Input } from "../../Input";
import { Field, FieldGroup, FieldLabel } from "../../Field";
import { NativeSelect, NativeSelectOption } from "../../NativeSelect";
import { fixture_invoices } from "../fixtures";

const meta: Meta<typeof Table> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Table",
  component: Table,
  tags: ["autodocs", "test"],
  render: (args) => (
    <Table {...args}>
      <TableCaption>Invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Invoice</TableHead>
          <TableHead scope="col">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-001</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
export default meta;
export const AlignedColumns: StoryObj<typeof Table> = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead textAlign="start">Track</TableHead>
          <TableHead textAlign="center">Length</TableHead>
          <TableHead textAlign="end">BPM</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell textAlign="start">First light</TableCell>
          <TableCell textAlign="center">5:00</TableCell>
          <TableCell textAlign="end">123</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByRole("columnheader", { name: "BPM" })).textAlign).toBe("end");
    await expect(getComputedStyle(canvas.getByRole("cell", { name: "123" })).textAlign).toBe("end");
    await expect(getComputedStyle(canvas.getByRole("cell", { name: "5:00" })).textAlign).toBe("center");
    await expect(getComputedStyle(canvas.getByRole("cell", { name: "First light" })).textAlign).toBe("start");
  },
};
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table", { name: "Invoices" }));
    await expect(table.getByRole("columnheader", { name: "Invoice" })).toHaveAttribute("scope", "col");
    await expect(table.getByRole("cell", { name: "INV-001" })).toBeVisible();
    await expect(table.getByRole("row", { name: "Total $250.00" })).toBeVisible();
  },
};
export const Compact: Story = { ...Default, args: { density: "compact" } };

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async (context) => {
    await Default.play?.(context);
    const canvas = within(context.canvasElement);
    const table = canvas.getByRole("table", { name: "Invoices" });
    const header = within(table).getByRole("columnheader", { name: "Invoice" });
    const amount = within(table).getByRole("columnheader", { name: "Amount" });
    const range = header.ownerDocument.createRange();
    range.selectNodeContents(header);
    await expect(header.getBoundingClientRect().left).toBeGreaterThan(amount.getBoundingClientRect().left);
    await expect(range.getBoundingClientRect().right).toBeCloseTo(
      header.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(header).paddingInlineStart),
      1,
    );
    await expect(getComputedStyle(table.parentElement!).direction).toBe("rtl");
  },
};

type InvoiceRecord = (typeof fixture_invoices)[number];
const invoiceFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
});
const invoiceColumnHelper = createColumnHelper<typeof invoiceFeatures, InvoiceRecord>();
const invoiceColumns = invoiceColumnHelper.columns([
  invoiceColumnHelper.display({
    id: "selection",
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked, details) => table.getToggleAllPageRowsSelectedHandler()(details.event)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={"Select " + row.original.email}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked, details) => row.getToggleSelectedHandler()(details.event)}
      />
    ),
  }),
  invoiceColumnHelper.accessor("email", {
    header: ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        Email
      </Button>
    ),
    cell: (context) => context.getValue(),
    filterFn: "includesString",
    sortFn: "alphanumeric",
  }),
  invoiceColumnHelper.accessor("amount", {
    header: ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        Amount
      </Button>
    ),
    cell: (context) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(context.getValue()),
    sortDescFirst: false,
  }),
]);

type InvoiceRowActionsProps = { invoice: InvoiceRecord };
function InvoiceRowActions({ invoice }: InvoiceRowActionsProps): ReactElement {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copyResult, setCopyResult] = useState("");
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={"Actions for " + invoice.email}
        >
          <MoreHorizontalIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label={"Actions for " + invoice.email}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Invoice actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(invoice.id);
                  setCopyResult("Invoice ID copied.");
                } catch {
                  setCopyResult("Clipboard access denied.");
                }
              }}
            >
              Copy invoice ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>View invoice</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <output aria-label={"Copy result for " + invoice.email}>{copyResult}</output>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent finalFocus={triggerRef}>
          <DialogTitle>{"Invoice " + invoice.id}</DialogTitle>
          <DialogDescription>Read-only invoice details.</DialogDescription>
          <dl>
            <dt>Customer</dt>
            <dd>{invoice.email}</dd>
            <dt>Amount</dt>
            <dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.amount)}</dd>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
const invoiceActionColumns = invoiceColumnHelper.columns([
  ...invoiceColumns,
  invoiceColumnHelper.display({
    id: "actions",
    header: "Actions",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
  }),
]);
type InvoiceTableProps = ComponentProps<typeof Table> & { records?: InvoiceRecord[]; hasRowActions?: boolean };
function InvoiceTable({ records = fixture_invoices, hasRowActions = false, ...args }: InvoiceTableProps): ReactElement {
  const id = useId();
  const table = useTable({
    features: invoiceFeatures,
    columns: hasRowActions ? invoiceActionColumns : invoiceColumns,
    data: records,
    getRowId: (record) => record.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  });
  const emailColumn = table.getColumn("email");
  const emailFilter = emailColumn?.getFilterValue();
  const amountColumn = table.getColumn("amount");
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={id + "-filter"}>Filter emails</FieldLabel>
        <Input
          id={id + "-filter"}
          value={typeof emailFilter === "string" ? emailFilter : ""}
          onChange={(event) => emailColumn?.setFilterValue(event.target.value)}
        />
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id={id + "-visibility"}
          checked={amountColumn?.getIsVisible() ?? false}
          onCheckedChange={(checked) => amountColumn?.toggleVisibility(checked)}
        />
        <FieldLabel htmlFor={id + "-visibility"}>Show amount</FieldLabel>
      </Field>
      <Table {...args}>
        <TableCaption>Customer invoices</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    scope="col"
                    key={header.id}
                    aria-sort={
                      header.column.getCanSort()
                        ? sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getVisibleLeafColumns().length}>No matching invoices.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <output aria-label="Invoice selection">{table.getSelectedRowModel().rows.length} selected</output>
      <output aria-label="Invoice page">
        Page {table.state.pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
      </output>
      <Field orientation="horizontal">
        <Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
          Previous invoices
        </Button>
        <Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
          Next invoices
        </Button>
      </Field>
      <Field>
        <FieldLabel htmlFor={id + "-size"}>Invoices per page</FieldLabel>
        <NativeSelect
          id={id + "-size"}
          value={String(table.state.pagination.pageSize)}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          <NativeSelectOption value="2">2</NativeSelectOption>
          <NativeSelectOption value="5">5</NativeSelectOption>
        </NativeSelect>
      </Field>
    </FieldGroup>
  );
}

export const DataTableSorting: Story = {
  render: (args) => <InvoiceTable {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const table = within(canvas.getByRole("table", { name: "Customer invoices" }));
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect(table.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "ascending");
    await expect(
      table
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.textContent),
    ).toEqual(["drew@example.com$50.00", "blair@example.com$100.00"]);
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect(table.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "descending");
    await expect(
      table
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.textContent),
    ).toEqual(["casey@example.com$300.00", "alex@example.com$250.00"]);
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect(table.getByRole("cell", { name: "alex@example.com" })).toBeVisible();
  },
};

export const DataTableFiltering: Story = {
  render: (args) => <InvoiceTable {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const filter = canvas.getByRole("textbox", { name: "Filter emails" });
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    await expect(canvas.getByRole("cell", { name: "casey@example.com" })).toBeVisible();
    await userEvent.type(filter, "alex");
    await waitFor(() => expect(canvas.getByRole("cell", { name: "alex@example.com" })).toBeVisible());
    await expect(canvas.getByRole("status", { name: "Invoice page" })).toHaveTextContent("Page 1 of 1");
    await expect(canvas.queryByRole("cell", { name: "casey@example.com" })).not.toBeInTheDocument();
    await userEvent.clear(filter);
    await expect(canvas.getByRole("status", { name: "Invoice page" })).toHaveTextContent("Page 1 of 3");
    await userEvent.type(filter, "nobody");
    await expect(canvas.getByRole("cell", { name: "No matching invoices." })).toHaveAttribute("colspan", "3");
    await expect(canvas.getByRole("button", { name: "Next invoices" })).toBeDisabled();
  },
};

export const DataTablePagination: Story = {
  render: (args) => <InvoiceTable {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Previous invoices" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    await expect(canvas.getByRole("status", { name: "Invoice page" })).toHaveTextContent("Page 2 of 3");
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    await expect(canvas.getByRole("cell", { name: "erin@example.com" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Next invoices" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Previous invoices" }));
    await expect(canvas.getByRole("cell", { name: "casey@example.com" })).toBeVisible();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Invoices per page" }), "5");
    await expect(within(canvas.getByRole("table", { name: "Customer invoices" })).getAllByRole("row")).toHaveLength(6);
    await expect(canvas.getByRole("button", { name: "Next invoices" })).toBeDisabled();
  },
};

export const DataTableSelection: Story = {
  render: (args) => <InvoiceTable {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select alex@example.com" }));
    await expect(canvas.getByRole("checkbox", { name: "Select page" })).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select drew@example.com" }));
    await userEvent.keyboard("{/Shift}");
    await expect(canvas.getByRole("status", { name: "Invoice selection" })).toHaveTextContent("4 selected");
    await expect(canvas.getByRole("checkbox", { name: "Select page" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Previous invoices" }));
    await expect(canvas.getByRole("checkbox", { name: "Select blair@example.com" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select page" }));
    await expect(canvas.getByRole("status", { name: "Invoice selection" })).toHaveTextContent("2 selected");
  },
};

export const DataTableVisibility: Story = {
  render: (args) => <InvoiceTable {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Show amount" }));
    await expect(canvas.queryByRole("columnheader", { name: "Amount" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("cell", { name: "$250.00" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("cell", { name: "alex@example.com" })).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Show amount" }));
    await expect(canvas.getByRole("cell", { name: "$250.00" })).toBeVisible();
  },
};

export const DataTableCompact: Story = { ...DataTableSorting, args: { density: "compact" } };

export const DataTableRightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <InvoiceTable {...args} />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Customer invoices" });
    const pageCheckbox = within(table).getByRole("checkbox", { name: "Select page" });
    const rowCheckbox = within(table).getByRole("checkbox", { name: "Select alex@example.com" });
    const header = pageCheckbox.closest("th")!;
    const cell = rowCheckbox.closest("td")!;
    await expect(getComputedStyle(header).paddingInlineEnd).toBe("0px");
    await expect(getComputedStyle(cell).paddingInlineEnd).toBe("0px");
    await expect(Number.parseFloat(getComputedStyle(header).paddingInlineStart)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(cell).paddingInlineStart)).toBeGreaterThan(0);
    await userEvent.click(rowCheckbox);
    await expect(pageCheckbox).toHaveAttribute("aria-checked", "mixed");
    await expect(canvas.getByRole("status", { name: "Invoice selection" })).toHaveTextContent("1 selected");
    await userEvent.click(pageCheckbox);
    await expect(canvas.getByRole("status", { name: "Invoice selection" })).toHaveTextContent("2 selected");
    await expect(rowCheckbox).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    await expect(within(table).getByRole("cell", { name: "casey@example.com" })).toBeVisible();
  },
};

export const DataTableCompactRightToLeft: Story = { ...DataTableRightToLeft, args: { density: "compact" } };

export const DataTableRowActions: Story = {
  render: (args) => <InvoiceTable {...args} hasRowActions />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Actions for alex@example.com" });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu", { name: "Actions for alex@example.com" });
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Copy invoice ID" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Copy result for alex@example.com" })).toHaveTextContent(
      "Invoice ID copied.",
    );
    await expect(await navigator.clipboard.readText()).toBe("inv-001");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    const detailsMenu = await body.findByRole("menu", { name: "Actions for alex@example.com" });
    await userEvent.click(within(detailsMenu).getByRole("menuitem", { name: "View invoice" }));
    const dialog = await body.findByRole("dialog", { name: "Invoice inv-001" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).getByText("alex@example.com")).toBeVisible();
    await expect(within(dialog).getByText("$250.00")).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Next invoices" }));
    const nextTrigger = canvas.getByRole("button", { name: "Actions for casey@example.com" });
    await userEvent.click(nextTrigger);
    const nextMenu = await body.findByRole("menu", { name: "Actions for casey@example.com" });
    await userEvent.click(within(nextMenu).getByRole("menuitem", { name: "View invoice" }));
    const nextDialog = await body.findByRole("dialog", { name: "Invoice inv-003" });
    await waitFor(() => expect(nextDialog).toBeVisible());
    await expect(within(nextDialog).getByText("$300.00")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(nextDialog).not.toBeInTheDocument());
    await waitFor(() => expect(nextTrigger).toHaveFocus());
  },
};

export const FixedLayout: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Table layout="fixed">
        <TableHeader>
          <TableRow>
            <TableHead truncate>Title</TableHead>
            <TableHead>Album</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell truncate title="A very long track title that exceeds its column">
              A very long track title that exceeds its column
            </TableCell>
            <TableCell truncate>A very long album title that exceeds its column</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table");
    const cell = canvas.getByRole("cell", { name: "A very long track title that exceeds its column" });
    await expect(table.parentElement!.scrollWidth).toBe(table.parentElement!.clientWidth);
    await expect(cell.scrollWidth).toBeGreaterThan(cell.clientWidth);
    await expect(getComputedStyle(cell).textOverflow).toBe("ellipsis");
    await expect(table.getBoundingClientRect().width).toBe(280);
  },
};

export const ResponsiveColumns: Story = {
  render: function ResponsiveColumns() {
    const [isWide, setWide] = useState(false);
    return (
      <>
        <Button onClick={() => setWide(!isWide)}>Resize table</Button>
        <div className={isWide ? "w-[600px]" : "w-[350px]"}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead visibleFrom="container-sm">BPM</TableHead>
                <TableHead visibleFrom="container-md">Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>First light</TableCell>
                <TableCell visibleFrom="container-sm">123</TableCell>
                <TableCell visibleFrom="container-md">FLAC</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    );
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("BPM", { exact: true })).not.toBeVisible();
    await expect(canvas.getByText("123", { exact: true })).not.toBeVisible();
    await expect(canvas.getByText("Format", { exact: true })).not.toBeVisible();
    await expect(canvas.getByText("FLAC", { exact: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Resize table" }));
    await expect(canvas.getByRole("columnheader", { name: "BPM" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "123" })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: "Format" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "FLAC" })).toBeVisible();
  },
};

export const ResponsiveColumnWidths: Story = {
  render: function ResponsiveColumnWidths() {
    const [isWide, setWide] = useState(false);
    return (
      <>
        <Button onClick={() => setWide(!isWide)}>Resize table</Button>
        {/* The outer width differs from the table container, as when a scroll viewport narrows the table. */}
        <div className={isWide ? "w-[420px]" : "w-[390px]"}>
          <Table layout="fixed">
            <TableColumnGroup>
              <TableColumn />
              <TableColumn visibleFrom="container-sm" style={{ width: 60 }} />
            </TableColumnGroup>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead visibleFrom="container-sm">BPM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>First light</TableCell>
                <TableCell visibleFrom="container-sm">123</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    );
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table");
    const title = canvas.getByRole("columnheader", { name: "Title" });
    // Below the breakpoint the column hides with its cells, so the remaining column takes the whole width.
    await expect(canvas.getByText("BPM", { exact: true })).not.toBeVisible();
    await expect(title.getBoundingClientRect().width).toBe(table.getBoundingClientRect().width);
    await userEvent.click(canvas.getByRole("button", { name: "Resize table" }));
    await waitFor(() => expect(canvas.getByRole("columnheader", { name: "BPM" })).toBeVisible());
    await expect(canvas.getByRole("columnheader", { name: "BPM" }).getBoundingClientRect().width).toBe(60);
  },
};
