import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type Key,
  type ReactElement,
  type ReactNode,
} from "react";
import { defaultRangeExtractor, useVirtualizer, type Range } from "@tanstack/react-virtual";
import { Table, TableBody, TableHeader } from "../Table.js";

export interface IVirtualTableRowProps {
  ref: (element: HTMLTableRowElement | null) => void;
  "data-index": number;
  "aria-rowindex": number;
}

interface IVirtualTableProps<T> {
  items: readonly T[];
  getItemKey: (item: T) => Key;
  renderRow: (item: T, props: IVirtualTableRowProps) => ReactNode;
  header: ReactNode;
  columns?: ReactNode;
  label: string;
  maxHeight?: number | string;
  estimateRowHeight?: number;
  overscan?: number;
  retainedKeys?: readonly Key[];
  layout?: ComponentProps<typeof Table>["layout"];
}

export function VirtualTable<T>({
  items,
  getItemKey,
  renderRow,
  header,
  columns,
  label,
  maxHeight = "65vh",
  estimateRowHeight = 80,
  overscan = 5,
  retainedKeys,
  layout = "fixed",
}: IVirtualTableProps<T>): ReactElement {
  const viewport = useRef<HTMLDivElement>(null);
  const [focusedKey, setFocusedKey] = useState<Key>();
  const retained = useMemo(
    () =>
      items.flatMap((item, index) =>
        retainedKeys?.includes(getItemKey(item)) || getItemKey(item) === focusedKey ? [index] : [],
      ),
    [items, retainedKeys, getItemKey, focusedKey],
  );
  const rangeExtractor = useCallback(
    (range: Range) => [...new Set([...defaultRangeExtractor(range), ...retained])].sort((a, b) => a - b),
    [retained],
  );
  const itemKey = useCallback((index: number) => getItemKey(items[index]!), [items, getItemKey]);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => viewport.current,
    getItemKey: itemKey,
    estimateSize: () => estimateRowHeight,
    overscan,
    rangeExtractor,
    // Measuring inside the ResizeObserver callback resizes rows it observes, which the browser reports as an
    // undelivered-notification loop; measuring on the next frame keeps each callback free of layout changes.
    useAnimationFrameWithResizeObserver: true,
  });
  const rows = virtualizer.getVirtualItems();
  const last = rows.at(-1);
  return (
    <div
      ref={viewport}
      data-testid="VirtualTable"
      role="region"
      aria-label={label}
      tabIndex={0}
      className="min-w-0 overflow-auto overscroll-contain"
      style={{ maxHeight }}
      onFocusCapture={(event) => {
        const row = event.target.closest<HTMLTableRowElement>("tr[data-index]");
        const item = items[Number(row?.dataset.index)];
        if (row && item) setFocusedKey(getItemKey(item));
      }}
    >
      {/* Spacer rows hold only one cell, so they never add grid columns that hidden responsive cells leave empty. */}
      <Table layout={layout} aria-label={label} aria-rowcount={items.length + 1}>
        {columns}
        <TableHeader>{header}</TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <Fragment key={row.key}>
              {row.start > (rows[index - 1]?.end ?? 0) && (
                <tr aria-hidden="true">
                  <td style={{ height: row.start - (rows[index - 1]?.end ?? 0), padding: 0, border: 0 }} />
                </tr>
              )}
              {renderRow(items[row.index]!, {
                ref: virtualizer.measureElement,
                "data-index": row.index,
                "aria-rowindex": row.index + 2,
              })}
            </Fragment>
          ))}
          {last && virtualizer.getTotalSize() > last.end && (
            <tr aria-hidden="true">
              <td style={{ height: virtualizer.getTotalSize() - last.end, padding: 0, border: 0 }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
