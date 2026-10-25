import {
  FlexRender,
  columnFilteringFeature,
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  type CellData,
  type Column,
  type Header,
  type ReactTable,
  type Row,
  type RowData,
  type Table as CoreTable,
  type TableState,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { useId, type AriaAttributes, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableColumn,
  TableColumnGroup,
  type TableTextAlign,
  type TableVisibility,
} from "../Table.js";
import { NativeSelect, NativeSelectOption } from "../NativeSelect.js";
import { Input } from "../Input.js";
import { DataGridColumnResizer } from "./DataGridColumnResizer.js";
import { getDataGridColumnSizeVariables } from "./getDataGridColumnSizeVariables.js";

/** Presentation settings a column definition carries in its `meta`. */
interface IDataGridColumnMeta {
  /** Name in the column picker and resize handle; defaults to a string header, then the column ID. */
  label?: string;
  textAlign?: TableTextAlign;
  truncate?: boolean;
  /** Hides the column below this viewport or container width, together with its header and cells. */
  visibleFrom?: TableVisibility;
  /** Takes the width the sized columns leave, so it has no fixed size of its own. */
  fill?: boolean;
}
// TanStack reads the feature set's `columnMeta` slot only for its type.
const columnMeta: IDataGridColumnMeta = {};
const dataGridFeatures = tableFeatures({
  columnFilteringFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  columnMeta,
});
type DataGridFeatures = typeof dataGridFeatures;
/** A table built with `dataGridFeatures`; `TSelected` is the state its `useTable` selector returns. */
type DataGridTable<T extends RowData, TSelected = TableState<DataGridFeatures>> = ReactTable<
  DataGridFeatures,
  T,
  TSelected
>;
type DataGridRow<T extends RowData> = Row<DataGridFeatures, T>;
type DataGridColumn<T extends RowData> = Column<DataGridFeatures, T, CellData>;

function getDataGridColumnLabel<T extends RowData>(column: DataGridColumn<T>): string {
  const header = column.columnDef.header;
  return column.columnDef.meta?.label ?? (typeof header === "string" ? header : column.id);
}

function getAriaSort<T extends RowData>(column: DataGridColumn<T>): AriaAttributes["aria-sort"] {
  if (!column.getCanSort()) return undefined;
  const sorted = column.getIsSorted();
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
}

interface IDataGridHeaderCellProps<T extends RowData> {
  header: Header<DataGridFeatures, T, CellData>;
  isResizable: boolean;
}

function DataGridHeaderCell<T extends RowData>({ header, isResizable }: IDataGridHeaderCellProps<T>): ReactElement {
  const contentId = useId();
  const meta = header.column.columnDef.meta;
  const hasResizer = isResizable && !meta?.fill && header.column.getCanResize();
  return (
    <TableHead
      scope="col"
      colSpan={header.colSpan}
      aria-sort={getAriaSort(header.column)}
      // The resize handle's own label would otherwise become part of the column's name.
      aria-labelledby={hasResizer ? contentId : undefined}
      textAlign={meta?.textAlign}
      truncate={meta?.truncate}
      visibleFrom={meta?.visibleFrom}
      className={hasResizer ? "relative" : undefined}
    >
      {hasResizer ? (
        <>
          <span id={contentId}>{header.isPlaceholder ? null : <FlexRender header={header} />}</span>
          <DataGridColumnResizer header={header} label={getDataGridColumnLabel(header.column)} />
        </>
      ) : header.isPlaceholder ? null : (
        <FlexRender header={header} />
      )}
    </TableHead>
  );
}

interface IDataGridHeaderRowsProps<T extends RowData> {
  table: CoreTable<DataGridFeatures, T>;
  /** Adds a resize handle to each resizable column; only fixed-layout grids honor column sizes. */
  isResizable?: boolean;
}

/** Header rows with sort state, column layout, and optional resize handles. */
function DataGridHeaderRows<T extends RowData>({
  table,
  isResizable = false,
}: IDataGridHeaderRowsProps<T>): ReactElement {
  return (
    <>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id}>
          {group.headers.map((header) => (
            <DataGridHeaderCell key={header.id} header={header} isResizable={isResizable} />
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface IDataGridCellsProps<T extends RowData> {
  row: DataGridRow<T>;
}

/** A row's visible cells, laid out by their column `meta`; render them inside a custom `TableRow`. */
function DataGridCells<T extends RowData>({ row }: IDataGridCellsProps<T>): ReactElement {
  return (
    <>
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta;
        return (
          <TableCell
            key={cell.id}
            textAlign={meta?.textAlign}
            truncate={meta?.truncate}
            visibleFrom={meta?.visibleFrom}
          >
            <FlexRender cell={cell} />
          </TableCell>
        );
      })}
    </>
  );
}

interface IDataGridColumnsProps<T extends RowData> {
  table: CoreTable<DataGridFeatures, T>;
}

/** Column widths for a fixed-layout grid; sizes resolve through the variables `useDataGridColumnSizes` writes. */
function DataGridColumns<T extends RowData>({ table }: IDataGridColumnsProps<T>): ReactElement {
  const variables = getDataGridColumnSizeVariables(table);
  return (
    <TableColumnGroup>
      {table.getVisibleLeafColumns().map((column) => {
        const meta = column.columnDef.meta;
        const variable = variables.get(column.id);
        return (
          <TableColumn
            key={column.id}
            visibleFrom={meta?.visibleFrom}
            width={meta?.fill ? undefined : `var(${variable}, ${column.getSize()}px)`}
          />
        );
      })}
    </TableColumnGroup>
  );
}

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
            <DataGridHeaderRows table={table} />
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
                  <DataGridCells row={row} />
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
  column: Column<DataGridFeatures, T, V>;
  children: ReactNode;
}): ReactElement {
  const sorted = column.getIsSorted();
  return column.getCanSort() ? (
    <Button type="button" variant="ghost" size="inline" onClick={column.getToggleSortingHandler()}>
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
export {
  DataGrid,
  DataGridCells,
  DataGridColumnHeader,
  DataGridColumns,
  DataGridFilter,
  DataGridHeaderRows,
  DataGridPagination,
  dataGridFeatures,
  getDataGridColumnLabel,
};
export type { DataGridColumn, DataGridFeatures, DataGridProps, DataGridRow, DataGridTable, IDataGridColumnMeta };
