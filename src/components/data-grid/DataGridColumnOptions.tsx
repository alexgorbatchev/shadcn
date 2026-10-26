import { Subscribe, type RowData } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, Columns3Icon } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "../Button.js";
import { Checkbox } from "../Checkbox.js";
import { Label } from "../Label.js";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "../Popover.js";
import { getDataGridColumnLabel, type IDataGridControlProps } from "./DataGrid.js";
import { moveDataGridColumn } from "./moveDataGridColumn.js";

/**
 * Shows, hides, and reorders the columns that allow hiding. Columns with `enableHiding: false` keep their positions.
 * Reset restores the table's initial visibility, order, and sizes. `label` titles the trigger and popover.
 */
export function DataGridColumnOptions<T extends RowData>({
  table,
  label = "Columns",
}: IDataGridControlProps<T>): ReactElement {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <Columns3Icon data-icon="inline-start" aria-hidden="true" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>{label}</PopoverTitle>
        </PopoverHeader>
        <Subscribe source={table.atoms.columnOrder}>
          {() => (
            <Subscribe source={table.atoms.columnVisibility}>
              {() => {
                const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
                const movableIds = columns.map((column) => column.id);
                const move = (columnId: string, offset: -1 | 1): void =>
                  table.setColumnOrder(
                    moveDataGridColumn(
                      table.getAllLeafColumns().map((column) => column.id),
                      movableIds,
                      columnId,
                      offset,
                    ),
                  );
                return (
                  <ul aria-label={label} className="grid gap-1">
                    {columns.map((column, index) => {
                      const name = getDataGridColumnLabel(column);
                      return (
                        <li key={column.id} className="flex items-center gap-1">
                          <Label className="min-w-0 flex-1 py-1">
                            <Checkbox
                              checked={column.getIsVisible()}
                              onCheckedChange={(checked) => column.toggleVisibility(checked)}
                            />
                            <span className="truncate">{name}</span>
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move ${name} earlier`}
                            disabled={index === 0}
                            onClick={() => move(column.id, -1)}
                          >
                            <ArrowUpIcon aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move ${name} later`}
                            disabled={index === columns.length - 1}
                            onClick={() => move(column.id, 1)}
                          >
                            <ArrowDownIcon aria-hidden="true" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            </Subscribe>
          )}
        </Subscribe>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.resetColumnVisibility();
            table.resetColumnOrder();
            table.resetColumnSizing();
          }}
        >
          Reset columns
        </Button>
      </PopoverContent>
    </Popover>
  );
}
