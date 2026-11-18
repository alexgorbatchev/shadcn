import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { Checkbox } from "./Checkbox.js";
import { cn } from "../utils/cn.js";

export interface IReviewListRow {
  id: string;
  /** Whether the plan includes this row's change. */
  isIncluded: boolean;
  /** The checkbox's accessible name, such as "Include Undertow Signal by Fenwick Rao". */
  checkboxLabel: string;
  /** The row's description, its first cell after the checkbox. */
  content: ReactNode;
  /** Further cells with their own controls, which ← and → reach; give those controls `tabIndex={-1}`. */
  cells?: readonly ReactNode[];
}

interface IReviewListProps {
  label: string;
  rows: readonly IReviewListRow[];
  /** Sets the inclusion of these rows; a range or Mod+A changes several at once. */
  onIncludedChange: (ids: readonly string[], isIncluded: boolean) => void;
}

interface ICursor {
  row: number;
  cell: number;
}

const TOGGLE_KEYS = new Set(["x", "X"]);

function isMod(event: KeyboardEvent | MouseEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

function isTextEntry(target: EventTarget): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input:not([type='checkbox']), textarea, select"))
  );
}

/**
 * A plan's review rows, where a tick means "include this change". It is one tab stop with a cursor: ↑/↓, Home and End
 * move between rows and ← and → between a row's cells. A click only moves the cursor, so a stray click never changes
 * what the plan includes; the checkbox, Mod+click, X and Shift+Space toggle a row, Shift+click sets the range from the
 * anchor row to the anchor's state, and Mod+A includes every row. Space is left to the page, such as a player.
 */
export function ReviewList({ label, rows, onIncludedChange }: IReviewListProps): ReactElement {
  const [cursor, setCursor] = useState<ICursor>({ row: 0, cell: 0 });
  const [anchorId, setAnchorId] = useState<string>();
  const cellsRef = useRef(new Map<string, HTMLElement>());
  const rowIndex = Math.min(cursor.row, Math.max(0, rows.length - 1));
  const cellCount = (row: IReviewListRow | undefined): number => 2 + (row?.cells?.length ?? 0);
  const focusCell = (row: number, cell: number): void => {
    const target = rows[row];
    if (!target) return;
    const column = Math.max(0, Math.min(cell, cellCount(target) - 1));
    setCursor({ row, cell: column });
    const element = cellsRef.current.get(`${target.id}:${column}`);
    const control = element?.querySelector<HTMLElement>("button, input, select, textarea, [tabindex]");
    (column > 1 && control ? control : element)?.focus();
  };
  const toggle = (row: IReviewListRow): void => {
    setAnchorId(row.id);
    onIncludedChange([row.id], !row.isIncluded);
  };
  const setRange = (row: number): void => {
    const anchorIndex = Math.max(
      0,
      rows.findIndex((candidate) => candidate.id === anchorId),
    );
    const anchor = rows[anchorIndex];
    if (!anchor) return;
    const [start, end] = anchorIndex <= row ? [anchorIndex, row] : [row, anchorIndex];
    onIncludedChange(
      rows.slice(start, end + 1).map((candidate) => candidate.id),
      anchor.isIncluded,
    );
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.altKey || isTextEntry(event.target)) return;
    const current = rows[rowIndex];
    if (!current) return;
    let handled = true;
    if (event.key === "ArrowDown") focusCell(Math.min(rows.length - 1, rowIndex + 1), cursor.cell);
    else if (event.key === "ArrowUp") focusCell(Math.max(0, rowIndex - 1), cursor.cell);
    else if (event.key === "Home") focusCell(0, cursor.cell);
    else if (event.key === "End") focusCell(rows.length - 1, cursor.cell);
    else if (event.key === "ArrowRight") focusCell(rowIndex, cursor.cell + 1);
    else if (event.key === "ArrowLeft") focusCell(rowIndex, cursor.cell - 1);
    else if ((TOGGLE_KEYS.has(event.key) && !isMod(event)) || (event.key === " " && event.shiftKey)) toggle(current);
    else if (event.key.toLowerCase() === "a" && isMod(event))
      onIncludedChange(
        rows.map((row) => row.id),
        true,
      );
    else handled = false;
    if (handled) event.preventDefault();
  };
  const onRowClick = (event: MouseEvent, row: IReviewListRow, index: number, cell: number): void => {
    if (event.shiftKey) setRange(index);
    else if (isMod(event)) toggle(row);
    else setAnchorId(row.id);
    setCursor({ row: index, cell });
  };
  return (
    <div
      data-slot="review-list"
      role="grid"
      aria-label={label}
      aria-rowcount={rows.length}
      className="flex min-w-0 flex-col gap-0.5"
      onKeyDown={onKeyDown}
    >
      {rows.map((row, index) => {
        const isCursorRow = index === rowIndex;
        const cellRef = (cell: number) => (element: HTMLElement | null) => {
          const key = `${row.id}:${cell}`;
          if (element) cellsRef.current.set(key, element);
          else cellsRef.current.delete(key);
        };
        const tabIndex = (cell: number): number => (isCursorRow && cursor.cell === cell ? 0 : -1);
        return (
          <div
            key={row.id}
            role="row"
            aria-rowindex={index + 1}
            data-included={row.isIncluded || undefined}
            className={cn(
              "flex min-w-0 items-start gap-2 rounded-sm px-1 py-0.5 focus-within:bg-accent/50",
              !row.isIncluded && "text-muted-foreground",
            )}
          >
            <div
              ref={cellRef(0)}
              role="gridcell"
              tabIndex={tabIndex(0)}
              className="flex shrink-0 items-center pt-0.5 outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={(event) => onRowClick(event, row, index, 0)}
            >
              <Checkbox
                aria-label={row.checkboxLabel}
                checked={row.isIncluded}
                tabIndex={-1}
                onCheckedChange={(_checked, details) => {
                  const native = details.event;
                  if (native instanceof globalThis.MouseEvent && (native.shiftKey || native.metaKey || native.ctrlKey))
                    return;
                  toggle(row);
                }}
              />
            </div>
            <div
              ref={cellRef(1)}
              role="gridcell"
              tabIndex={tabIndex(1)}
              className="min-w-0 flex-1 outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={(event) => onRowClick(event, row, index, 1)}
            >
              {row.content}
            </div>
            {row.cells?.map((cell, offset) => (
              <div
                // eslint-disable-next-line react/no-array-index-key -- cells are positional columns of one row
                key={offset}
                ref={cellRef(offset + 2)}
                role="gridcell"
                tabIndex={tabIndex(offset + 2)}
                className="shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={(event) => onRowClick(event, row, index, offset + 2)}
              >
                {cell}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
