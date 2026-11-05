import type { RowData } from "@tanstack/react-table";
import { useRef, type ReactElement, type ReactNode } from "react";
import { TableRow } from "../Table.js";
import {
  DataGridCells,
  DataGridColumns,
  DataGridHeaderRows,
  getDataGridColumnLabel,
  type DataGridRow,
  type DataGridTable,
} from "../data-grid/DataGrid.js";
import { useDataGridColumnSizes } from "../data-grid/hooks/useDataGridColumnSizes.js";
import { useDataGridColumnFit } from "../data-grid/hooks/useDataGridColumnFit.js";
import { DataGridColumnFitContext } from "../data-grid/DataGridColumnFitContext.js";
import { VirtualTable, type IVirtualTableRowProps } from "../virtual-table/VirtualTable.js";

interface IVirtualDataGridProps<T extends RowData, TSelected> {
  table: DataGridTable<T, TSelected>;
  label: string;
  maxHeight?: number | string;
  estimateRowHeight?: number;
  overscan?: number;
  /**
   * Reserve one fill column's preferred `size` and hide optional columns that do not fit, in their chosen order.
   * The fill column may shrink toward `minSize` when only required columns remain. Replaces
   * `meta.visibleFrom` breakpoints; saved visibility and widths are unchanged. Use exactly one fill column, and
   * ensure required columns' minima plus its minimum fit the smallest supported container. Only leaf headers resize.
   * Pair with `fitDataGridColumnSizing` and `constrainDataGridColumnSizing` to preserve preferred widths separately
   * from rendered widths and constrain native pointer resizing.
   */
  fitColumns?: boolean;
  /** Reports usable width; derive the sizing atom with `fitDataGridColumnSizing`, keeping preferences unchanged. */
  onFitWidthChange?: (width: number) => void;
  /** Row IDs that stay rendered while scrolled out of view, such as rows with an open editor. */
  retainedRowIds?: readonly string[];
  /**
   * Renders one row. Spread `props` onto the row element and render `DataGridCells` inside it; the default renders a
   * plain `TableRow` marked selected while the row is selected.
   */
  renderRow?: (row: DataGridRow<T>, props: IVirtualTableRowProps) => ReactNode;
}

function renderDefaultRow<T extends RowData>(row: DataGridRow<T>, props: IVirtualTableRowProps): ReactElement {
  return (
    <TableRow key={row.id} {...props} data-state={row.getIsSelected() ? "selected" : undefined}>
      <DataGridCells row={row} />
    </TableRow>
  );
}

/**
 * A virtualized, fixed-layout data grid over every filtered and sorted row, without pagination. Columns marked
 * `fill` take the remaining width; the others keep their sizes and can be resized by dragging or from the keyboard.
 * Column widths change through CSS variables, so a `useTable` selector can leave out sizing state and resizing never
 * renders rows again.
 */
export function VirtualDataGrid<T extends RowData, TSelected>({
  table,
  label,
  maxHeight,
  estimateRowHeight,
  overscan,
  fitColumns = false,
  onFitWidthChange,
  retainedRowIds,
  renderRow = renderDefaultRow,
}: IVirtualDataGridProps<T, TSelected>): ReactElement {
  const scope = useRef<HTMLDivElement>(null);
  useDataGridColumnSizes(table, scope);
  const fit = useDataGridColumnFit(table, scope, fitColumns, onFitWidthChange);
  const hiddenLabels = table
    .getVisibleLeafColumns()
    .filter((column) => fit?.hiddenColumnIds.includes(column.id))
    .map(getDataGridColumnLabel);
  return (
    <div ref={scope} data-testid="VirtualDataGrid" className="min-w-0">
      <DataGridColumnFitContext value={fit}>
        {hiddenLabels.length > 0 && (
          <div className="mb-2 text-xs text-muted-foreground">
            <p>Hidden to fit: {hiddenLabels.join(", ")}.</p>
            <p>Widen the table or choose fewer columns. Move a column earlier to prioritize it.</p>
          </div>
        )}
        <VirtualTable
          items={table.getPrePaginatedRowModel().rows}
          getItemKey={(row) => row.id}
          label={label}
          maxHeight={maxHeight}
          estimateRowHeight={estimateRowHeight}
          overscan={overscan}
          retainedKeys={retainedRowIds}
          columns={<DataGridColumns table={table} />}
          header={<DataGridHeaderRows table={table} isResizable />}
          renderRow={renderRow}
        />
      </DataGridColumnFitContext>
    </div>
  );
}
