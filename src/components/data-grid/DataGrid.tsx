import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  type ReactTable,
  type RowData,
  type Column,
  type CellData,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "../Table.js";
import { NativeSelect, NativeSelectOption } from "../NativeSelect.js";
import { Input } from "../Input.js";

const dataGridFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});
type DataGridTable<T extends RowData> = ReactTable<typeof dataGridFeatures, T>;
type DataGridProps<T extends RowData> = IDensityProps & {
  table: DataGridTable<T>;
  label: string;
  toolbar?: ReactNode;
  empty?: ReactNode;
  loading?: boolean;
  pagination?: boolean;
};
function DataGrid<T extends RowData>({
  table,
  label,
  toolbar,
  empty = "No results.",
  loading = false,
  pagination = true,
  density,
}: DataGridProps<T>): ReactElement {
  const rows = table.getRowModel().rows;
  return (
    <div data-density={density} data-scroll="none" className="grid min-w-0 gap-3" aria-busy={loading}>
      {toolbar}
      <div className="min-w-0 rounded-sm border border-border">
        <Table aria-label={label}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={
                      header.column.getCanSort()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length}>
                  <p role="status">Loading {label}…</p>
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
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
                <TableCell colSpan={table.getVisibleLeafColumns().length}>
                  <p role="status">{empty}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataGridPagination table={table} />}
    </div>
  );
}
function DataGridColumnHeader<T extends RowData, V extends CellData>({
  column,
  children,
}: {
  column: Column<typeof dataGridFeatures, T, V>;
  children: ReactNode;
}): ReactElement {
  const sorted = column.getIsSorted();
  return column.getCanSort() ? (
    <Button type="button" variant="ghost" size="sm" onClick={column.getToggleSortingHandler()}>
      {children}
      {sorted === "asc" ? (
        <ArrowUpIcon aria-hidden="true" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon aria-hidden="true" />
      ) : (
        <ChevronsUpDownIcon aria-hidden="true" />
      )}
    </Button>
  ) : (
    <span>{children}</span>
  );
}
function DataGridFilter<T extends RowData>({
  table,
  columnId,
  label,
}: {
  table: DataGridTable<T>;
  columnId: string;
  label: string;
}): ReactElement {
  const column = table.getColumn(columnId);
  if (!column) throw new Error(`Unknown filter column: ${columnId}`);
  const value = column.getFilterValue();
  return (
    <Input
      aria-label={label}
      placeholder={label}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => column.setFilterValue(event.target.value)}
    />
  );
}
function DataGridPagination<T extends RowData>({ table }: { table: DataGridTable<T> }): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span role="status">
        {table.getSelectedRowModel().rows.length} selected · Page {table.state.pagination.pageIndex + 1} of{" "}
        {Math.max(1, table.getPageCount())}
      </span>
      <div className="flex items-center gap-2">
        <NativeSelect
          aria-label="Rows per page"
          value={table.state.pagination.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <NativeSelectOption key={size} value={size}>
              {size} rows
            </NativeSelectOption>
          ))}
          {![10, 20, 50, 100].includes(table.state.pagination.pageSize) && (
            <NativeSelectOption value={table.state.pagination.pageSize}>
              {table.state.pagination.pageSize} rows
            </NativeSelectOption>
          )}
        </NativeSelect>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
export { DataGrid, DataGridColumnHeader, DataGridFilter, DataGridPagination, dataGridFeatures };
export type { DataGridProps, DataGridTable };
