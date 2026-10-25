import { createColumnHelper, useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import type { ReactElement, ReactNode } from "react";
import { Checkbox } from "../../Checkbox";
import {
  DataGridColumnHeader,
  DataGridColumnOptions,
  dataGridFeatures,
  type DataGridFeatures,
  type DataGridRow,
} from "../../data-grid";
import { VirtualDataGrid, type IVirtualTableRowProps } from "../../virtual-data-grid";
import type { GridFile } from "./types";

const helper = createColumnHelper<DataGridFeatures, GridFile>();
const columns = helper.columns([
  helper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all files"
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    size: 40,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
  }),
  helper.accessor("name", {
    header: ({ column }) => <DataGridColumnHeader column={column}>Name</DataGridColumnHeader>,
    sortFn: "alphanumeric",
    enableHiding: false,
    meta: { label: "Name", fill: true, truncate: true },
  }),
  helper.accessor((file) => file.kind, {
    id: "kind",
    header: "Kind",
    size: 100,
    minSize: 60,
    maxSize: 240,
    enableSorting: false,
    meta: { visibleFrom: "container-sm" },
  }),
  // Without a label or string header, the column picker names this column by its ID.
  helper.accessor((file) => file.owner, {
    id: "owner",
    header: () => <span>Owner</span>,
    size: 90,
    enableSorting: false,
  }),
  helper.accessor((file) => file.size, {
    id: "size",
    header: ({ column }) => <DataGridColumnHeader column={column}>Size</DataGridColumnHeader>,
    sortFn: "basic",
    size: 80,
    meta: { label: "Size", textAlign: "end" },
  }),
]);
const initialVisibility: ColumnVisibilityState = { owner: false };

interface IVirtualDataGridExampleProps {
  files: GridFile[];
  /** Fixed grid width in pixels, for responsive column checks. */
  width?: number;
  retainedRowIds?: readonly string[];
  renderRow?: (row: DataGridRow<GridFile>, props: IVirtualTableRowProps) => ReactNode;
}

export function VirtualDataGridExample({
  files,
  width,
  retainedRowIds,
  renderRow,
}: IVirtualDataGridExampleProps): ReactElement {
  // Leaving sizing out of the selector keeps resizing from rendering the grid again.
  const table = useTable(
    {
      features: dataGridFeatures,
      columns,
      data: files,
      getRowId: (file) => file.id,
      initialState: { columnVisibility: initialVisibility },
      // Columns follow the pointer while dragging; TanStack's default resizes only when the drag ends.
      columnResizeMode: "onChange",
    },
    ({ columnOrder, columnVisibility, rowSelection, sorting }) => ({
      columnOrder,
      columnVisibility,
      rowSelection,
      sorting,
    }),
  );
  return (
    <div className="grid gap-3" style={{ width }}>
      <div className="flex justify-end">
        <DataGridColumnOptions table={table} />
      </div>
      <VirtualDataGrid
        table={table}
        label="Files"
        maxHeight={300}
        estimateRowHeight={40}
        retainedRowIds={retainedRowIds}
        renderRow={renderRow}
      />
    </div>
  );
}
