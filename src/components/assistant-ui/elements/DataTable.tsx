import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.js";
import type { IDataTableProps, IDataTableSort, IDataTableColumn } from "../utils/dataTable/types.js";
import {
  relativeRefreshDelay,
  collatorFor,
  compareValues,
  isEmpty,
  rowIdentifier,
  isNumeric,
} from "../utils/dataTableUtils.js";
import { DataTableValueCell } from "./DataTableValueCell.js";
import { Button } from "../../Button.js";
import { Card } from "../../Card.js";
import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../Table.js";
export type {
  DataTableValue,
  DataTableRow,
  DataTableFormat,
  IDataTableColumn,
  IDataTableSort,
  IDataTableProps,
} from "../utils/dataTable/types.js";
export function DataTable({
  columns,
  rows,
  rowKey,
  caption,
  defaultSort,
  sort,
  onSortChange,
  locale = "en-US",
  emptyMessage = "No rows",
  relativeTo,
  ...props
}: IDataTableProps): JSX.Element {
  const [internalSort, setInternalSort] = useState<IDataTableSort | null>(defaultSort ?? null);
  const [announcement, setAnnouncement] = useState("");
  const activeSort = sort === undefined ? internalSort : sort;
  const hasRelativeDates = columns.some(
    (column) => column.format?.kind === "date" && column.format.style === "relative",
  );
  const [now, setNow] = useState<number>();
  useIsomorphicLayoutEffect(() => {
    if (relativeTo === undefined && hasRelativeDates) setNow(Date.now());
  }, [columns, rows, relativeTo, hasRelativeDates]);
  const relativeTime = relativeTo ?? now;
  const refreshDelay =
    relativeTo === undefined && hasRelativeDates && relativeTime !== undefined
      ? relativeRefreshDelay(columns, rows, relativeTime)
      : undefined;
  useEffect(() => {
    if (refreshDelay === undefined) return;
    const timeout = window.setTimeout(() => setNow(Date.now()), refreshDelay);
    return () => window.clearTimeout(timeout);
  }, [refreshDelay, relativeTime]);
  const sortColumn = columns.find((column) => column.key === activeSort?.key);
  const collator = collatorFor(locale);
  const indexedRows = rows.map((row, index) => ({ row, index }));
  const sortedRows =
    activeSort && sortColumn
      ? indexedRows.sort((a, b) => {
          const result = compareValues(a.row[sortColumn.key], b.row[sortColumn.key], sortColumn, collator);
          if (result === 0) return a.index - b.index;
          if (isEmpty(a.row[sortColumn.key]) || isEmpty(b.row[sortColumn.key])) {
            return result;
          }
          return activeSort.direction === "asc" ? result : -result;
        })
      : indexedRows;
  const primaryColumn = columns.find((column) => column.priority === "primary") ?? columns[0];
  const changeSort = (column: IDataTableColumn) => {
    const next =
      activeSort?.key !== column.key
        ? { key: column.key, direction: "asc" as const }
        : activeSort.direction === "asc"
          ? { key: column.key, direction: "desc" as const }
          : null;
    if (sort === undefined) setInternalSort(next);
    setAnnouncement(
      next ? `Sorted by ${column.label}, ${next.direction === "asc" ? "ascending" : "descending"}` : "Sorting cleared",
    );
    onSortChange?.(next);
  };
  return (
    <Card data-testid="DataTable" className="@container w-full gap-0" {...props}>
      <Table className="hidden w-full border-collapse @md:table">
        {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const direction = activeSort?.key === column.key ? activeSort.direction : undefined;
              const sortable = column.sortable !== false;
              return (
                <TableHead
                  key={column.key}
                  scope="col"
                  {...(direction
                    ? {
                        "aria-sort": direction === "asc" ? "ascending" : "descending",
                      }
                    : {})}
                  style={column.width ? { width: column.width } : undefined}
                  textAlign={column.align ?? (isNumeric(column.format) ? "end" : "start")}
                >
                  {sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => changeSort(column)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      {direction ? (
                        <span aria-hidden className="ms-1">
                          {direction === "asc" ? "↑" : "↓"}
                        </span>
                      ) : null}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={Math.max(columns.length, 1)} className="text-center text-sm text-muted-foreground">
                <span role="status">{emptyMessage}</span>
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map(({ row, index }) => (
              <TableRow key={rowIdentifier(row, rowKey, index)}>
                {columns.map((column) => (
                  <TableCell key={column.key} textAlign={column.align ?? (isNumeric(column.format) ? "end" : "start")}>
                    <DataTableValueCell column={column} row={row} locale={locale} relativeTo={relativeTime} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ul aria-label="Rows" className="space-y-control-gap p-panel @md:hidden">
        {sortedRows.length === 0 ? (
          <li className="px-panel py-control-y text-center text-sm text-muted-foreground">
            <span role="status">{emptyMessage}</span>
          </li>
        ) : (
          sortedRows.map(({ row, index }) => (
            <li
              key={rowIdentifier(row, rowKey, index)}
              className="rounded-sm bg-secondary px-control-x py-control-y transition-colors motion-reduce:transition-none"
            >
              {primaryColumn ? (
                <div className="text-sm font-medium">
                  <DataTableValueCell column={primaryColumn} row={row} locale={locale} relativeTo={relativeTime} />
                </div>
              ) : null}
              {columns.length > 1 ? (
                <dl className="mt-control-gap grid grid-cols-1 gap-x-panel gap-y-control-gap text-sm @xs:grid-cols-2">
                  {columns
                    .filter((column) => column.key !== primaryColumn?.key)
                    .map((column) => (
                      <div key={column.key} className="flex min-w-0 items-baseline justify-between gap-2">
                        <dt className="text-muted-foreground truncate">{column.label}</dt>
                        <dd className="shrink-0 text-end tabular-nums">
                          <DataTableValueCell column={column} row={row} locale={locale} relativeTo={relativeTime} />
                        </dd>
                      </div>
                    ))}
                </dl>
              ) : null}
            </li>
          ))
        )}
      </ul>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </Card>
  );
}
