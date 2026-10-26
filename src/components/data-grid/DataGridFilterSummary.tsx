import { Subscribe, type RowData } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "../Badge.js";
import { Button } from "../Button.js";
import type { IDataGridControlProps } from "./DataGrid.js";
import { describeDataGridFilter } from "./describeDataGridFilter.js";
import { getDataGridFilterLabel } from "./getDataGridFilterLabel.js";

/**
 * Lists the active filters of columns whose `meta.filter` describes one, each with a button that removes it, followed by
 * Clear filters. Renders nothing while no such filter is active. `label` names the list.
 */
export function DataGridFilterSummary<T extends RowData>({
  table,
  label = "Active filters",
}: IDataGridControlProps<T>): ReactElement {
  return (
    <Subscribe source={table.atoms.columnFilters}>
      {() => {
        const active = table.getAllLeafColumns().flatMap((column) => {
          const filter = column.columnDef.meta?.filter;
          const description = filter ? describeDataGridFilter(filter, column.getFilterValue()) : "";
          return description ? [{ column, description, name: getDataGridFilterLabel(column) }] : [];
        });
        return (
          <>
            {active.length > 0 && (
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <ul aria-label={label} className="flex min-w-0 flex-wrap gap-1.5">
                  {active.map(({ column, description, name }) => (
                    <li key={column.id} className="min-w-0">
                      <Badge variant="outline" className="max-w-full pe-0">
                        <span className="truncate">
                          {name}: {description}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Remove ${name} filter`}
                          onClick={() => column.setFilterValue(undefined)}
                        >
                          <XIcon aria-hidden="true" />
                        </Button>
                      </Badge>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" size="sm" onClick={() => table.setColumnFilters([])}>
                  Clear filters
                </Button>
              </div>
            )}
          </>
        );
      }}
    </Subscribe>
  );
}
