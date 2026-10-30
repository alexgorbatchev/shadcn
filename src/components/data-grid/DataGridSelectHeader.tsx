import { Subscribe, type RowData } from "@tanstack/react-table";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Checkbox } from "../Checkbox.js";
import type { IDataGridControlProps } from "./DataGrid.js";

type DataGridSelectHeaderProps<T extends RowData> = IDataGridControlProps<T> & IDensityProps;

/** Selects the selectable filtered rows across every page, preserving selections hidden by filters. */
export function DataGridSelectHeader<T extends RowData>({
  table,
  label = "Select all filtered rows",
  density,
}: DataGridSelectHeaderProps<T>): ReactElement {
  return (
    <Subscribe
      source={table.store}
      selector={(state) => ({
        selection: state.rowSelection,
        filters: state.columnFilters,
        filter: state.globalFilter,
      })}
    >
      {() => {
        const rows = table
          .getFilteredRowModel()
          .flatRows.filter(
            (row) => row.getCanSelect() && row.getParentRows().every((parent) => parent.getCanSelectSubRows()),
          );
        const selected = rows.filter((row) => row.getIsSelected()).length;
        return (
          <Checkbox
            aria-label={label}
            density={density}
            disabled={rows.length === 0}
            checked={rows.length > 0 && selected === rows.length}
            indeterminate={selected > 0 && selected < rows.length}
            onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
          />
        );
      }}
    </Subscribe>
  );
}

export type { DataGridSelectHeaderProps };
