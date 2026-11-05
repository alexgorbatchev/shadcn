import type { ColumnDef_ColumnSizing } from "@tanstack/react-table";

/** The fill reservation before optional columns are admitted, bounded by the column's native sizing limits. */
export function getDataGridFillPreferredSize(column: ColumnDef_ColumnSizing): number {
  return Math.min(column.maxSize ?? Number.MAX_SAFE_INTEGER, Math.max(column.minSize ?? 20, column.size ?? 150));
}
