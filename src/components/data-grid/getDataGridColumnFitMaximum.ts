import type { RowData, Table } from "@tanstack/react-table";
import type { DataGridFeatures } from "./DataGrid.js";
import { getDataGridColumnFit } from "./getDataGridColumnFit.js";

/** The resize ceiling that keeps the current fitted columns and the fill columns' minimum space. */
export function getDataGridColumnFitMaximum<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  columnId: string,
  width: number,
): number {
  const hidden = getDataGridColumnFit(table, width);
  const column = table.getColumn(columnId);
  const occupied = table.getVisibleLeafColumns().reduce((sum, other) => {
    if (other.id === columnId || hidden.includes(other.id)) return sum;
    return sum + (other.columnDef.meta?.fill ? (other.columnDef.minSize ?? 20) : other.getSize());
  }, 0);
  return Math.max(
    column?.columnDef.minSize ?? 20,
    Math.min(column?.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER, Math.floor(width - occupied)),
  );
}
