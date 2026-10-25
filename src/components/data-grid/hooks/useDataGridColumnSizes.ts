import type { RowData, Table } from "@tanstack/react-table";
import { useLayoutEffect, type RefObject } from "react";
import type { DataGridFeatures } from "../DataGrid.js";
import { getDataGridColumnSizeVariables } from "../getDataGridColumnSizeVariables.js";

/**
 * Writes every column's size to its CSS variable on `scope` whenever column sizing changes, so resizing updates widths
 * without rendering the grid again.
 */
export function useDataGridColumnSizes<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  scope: RefObject<HTMLElement | null>,
): void {
  // Runs after every render as well, because new column definitions change which variable each column uses.
  useLayoutEffect(() => {
    const write = (): void => {
      const element = scope.current;
      if (!element) return;
      for (const [id, variable] of getDataGridColumnSizeVariables(table)) {
        const column = table.getColumn(id);
        if (column) element.style.setProperty(variable, `${column.getSize()}px`);
      }
    };
    write();
    const subscription = table.atoms.columnSizing.subscribe(write);
    return () => subscription.unsubscribe();
  });
}
