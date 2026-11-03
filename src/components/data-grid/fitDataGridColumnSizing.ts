import type { ColumnSizingState, RowData, Table } from "@tanstack/react-table";
import type { DataGridFeatures } from "./DataGrid.js";

/**
 * Derive rendered sizes from preferred sizes. Required resizable columns give up space toward their minima only
 * when needed to preserve the fill minimum; widening restores the preferences. Store this result in the table's
 * sizing atom, separately from preferences, so native resize handlers start at the width the user sees.
 */
export function fitDataGridColumnSizing<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  preferred: ColumnSizingState,
  width: number,
): ColumnSizingState {
  const next = { ...preferred };
  if (width > 0) {
    const required = table
      .getVisibleLeafColumns()
      .filter((column) => !column.getCanHide() || column.columnDef.meta?.fill);
    const preferredSize = (column: (typeof required)[number]): number =>
      Math.min(
        column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
        Math.max(column.columnDef.minSize ?? 20, preferred[column.id] ?? column.columnDef.size ?? 150),
      );
    let excess =
      required.reduce(
        (sum, column) => sum + (column.columnDef.meta?.fill ? (column.columnDef.minSize ?? 20) : preferredSize(column)),
        0,
      ) - width;
    for (const column of required.toReversed()) {
      if (excess <= 0) break;
      if (column.columnDef.meta?.fill || !column.getCanResize()) continue;
      const size = preferredSize(column);
      const shrink = Math.min(excess, size - (column.columnDef.minSize ?? 20));
      if (shrink > 0) {
        next[column.id] = size - shrink;
        excess -= shrink;
      }
    }
  }
  const current = table.atoms.columnSizing.get();
  const entries = Object.entries(next);
  return entries.length === Object.keys(current).length && entries.every(([id, size]) => current[id] === size)
    ? current
    : next;
}
