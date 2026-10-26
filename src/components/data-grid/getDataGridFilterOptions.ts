import type { RowData } from "@tanstack/react-table";
import type { ILabelValue } from "../../options/types.js";
import type { DataGridColumn, DataGridFilterOptions } from "./DataGrid.js";

const NO_OPTIONS: readonly ILabelValue[] = [];

/** A column's options-filter choices: those the controls were given for it, else its own. */
function getDataGridFilterOptions<T extends RowData>(
  column: DataGridColumn<T>,
  options: DataGridFilterOptions | undefined,
): readonly ILabelValue[] {
  const filter = column.columnDef.meta?.filter;
  return options?.[column.id] ?? (filter?.variant === "options" ? filter.options : undefined) ?? NO_OPTIONS;
}

export { getDataGridFilterOptions };
