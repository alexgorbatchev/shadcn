import type { RowData } from "@tanstack/react-table";
import { getDataGridColumnLabel, type DataGridColumn } from "./DataGrid.js";

/** Names a column's filter: its own label, else the column's. */
function getDataGridFilterLabel<T extends RowData>(column: DataGridColumn<T>): string {
  return column.columnDef.meta?.filter?.label ?? getDataGridColumnLabel(column);
}

export { getDataGridFilterLabel };
