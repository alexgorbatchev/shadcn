import type { RowData, Table } from "@tanstack/react-table";
import type { DataGridFeatures } from "./DataGrid.js";

/** Columns that do not fit after reserving each fill column's minimum and every required fixed column. */
export function getDataGridColumnFit<T extends RowData>(table: Table<DataGridFeatures, T>, width: number): string[] {
  const columns = table.getVisibleLeafColumns();
  let remaining = width;
  for (const column of columns) {
    if (column.columnDef.meta?.fill) remaining -= column.columnDef.minSize ?? 20;
    else if (!column.getCanHide()) remaining -= column.getSize();
  }
  const hidden: string[] = [];
  for (const column of columns) {
    if (column.columnDef.meta?.fill || !column.getCanHide()) continue;
    if (column.getSize() <= remaining) remaining -= column.getSize();
    else hidden.push(column.id);
  }
  return hidden;
}
