import {
  functionalUpdate,
  type ColumnSizingState,
  type RowData,
  type Table,
  type Updater,
} from "@tanstack/react-table";
import type { DataGridFeatures } from "./DataGrid.js";
import { getDataGridColumnFitMaximum } from "./getDataGridColumnFitMaximum.js";

/**
 * Apply a user resize without displacing another fitted column or collapsing a fill column. Use in the table's
 * `onColumnSizingChange`, passing the width reported by `VirtualDataGrid.onFitWidthChange`, then store the result in
 * preferred sizes. Then pass those preferences through `fitDataGridColumnSizing` into the table's sizing atom.
 * Container changes never call this helper or rewrite preferred sizes.
 */
export function constrainDataGridColumnSizing<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  updater: Updater<ColumnSizingState>,
  width: number,
  preferred: ColumnSizingState,
): ColumnSizingState {
  const previous = table.atoms.columnSizing.get();
  const next = functionalUpdate(updater, previous);
  return Object.fromEntries(
    Object.entries(next)
      .map(([id, size]) => {
        const column = table.getColumn(id);
        if (size === previous[id]) return [id, preferred[id]];
        const fitted =
          width <= 0 || !column?.getIsVisible() || column.columnDef.meta?.fill
            ? size
            : Math.max(column.columnDef.minSize ?? 20, Math.min(size, getDataGridColumnFitMaximum(table, id, width)));
        return [id, fitted === (column?.getSize() ?? previous[id]) ? preferred[id] : fitted];
      })
      .filter(([, size]) => size !== undefined),
  );
}
