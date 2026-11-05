import type { RowData, Table } from "@tanstack/react-table";
import type { DataGridFeatures } from "./DataGrid.js";
import { getDataGridColumnFit } from "./getDataGridColumnFit.js";
import { getDataGridFillPreferredSize } from "./getDataGridFillPreferredSize.js";

/** Required columns reclaim optional space; optional columns keep fitted neighbours and the fill preference. */
export function getDataGridColumnFitMaximum<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  columnId: string,
  width: number,
): number {
  const hidden = getDataGridColumnFit(table, width);
  const column = table.getColumn(columnId);
  const isRequired = column && !column.getCanHide();
  const occupied = table.getVisibleLeafColumns().reduce((sum, other) => {
    if (other.id === columnId) return sum;
    if (other.columnDef.meta?.fill) {
      return sum + (isRequired ? (other.columnDef.minSize ?? 20) : getDataGridFillPreferredSize(other.columnDef));
    }
    if ((isRequired && other.getCanHide()) || hidden.includes(other.id)) return sum;
    return sum + other.getSize();
  }, 0);
  return Math.max(
    column?.columnDef.minSize ?? 20,
    Math.min(column?.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER, Math.floor(width - occupied)),
  );
}
