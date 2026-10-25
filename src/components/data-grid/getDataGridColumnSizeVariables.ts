import type { RowData, Table, TableFeatures } from "@tanstack/react-table";

/**
 * Maps each leaf column ID to the CSS variable holding its width. Variables follow definition order, so reordering or
 * hiding columns never moves a width to another column.
 */
export function getDataGridColumnSizeVariables<TFeatures extends TableFeatures, T extends RowData>(
  table: Table<TFeatures, T>,
): Map<string, string> {
  return new Map(
    table
      .getAllColumns()
      .flatMap((column) => column.getLeafColumns())
      .map((column, index) => [column.id, `--data-grid-column-${index}-size`]),
  );
}
