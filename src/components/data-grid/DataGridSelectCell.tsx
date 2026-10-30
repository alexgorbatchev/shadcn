import { Subscribe, type RowData } from "@tanstack/react-table";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Checkbox } from "../Checkbox.js";
import type { DataGridRow, IDataGridControlProps } from "./DataGrid.js";

interface DataGridSelectCellProps<T extends RowData> extends IDensityProps, IDataGridControlProps<T> {
  row: DataGridRow<T>;
  /** Names this row's selection control, such as "Select project Atlas". */
  label: string;
}

/** Uses the row's native selection rules, including disabled and partially selected parent rows. */
export function DataGridSelectCell<T extends RowData>({
  row,
  table,
  label,
  density,
}: DataGridSelectCellProps<T>): ReactElement {
  return (
    <Subscribe source={table.atoms.rowSelection}>
      {() => (
        <Checkbox
          aria-label={label}
          density={density}
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked)}
        />
      )}
    </Subscribe>
  );
}

export type { DataGridSelectCellProps };
