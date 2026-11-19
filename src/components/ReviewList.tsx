import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
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
  /** The row's depth in a tree review, from 1; any row with a level makes the list a tree grid. */
  level?: number;
  /** Whether a row with children shows them; leave unset on rows without children. Enter toggles it. */
  isExpanded?: boolean;
  /** Some but not all of the row's children are included; the checkbox shows the mixed state. */
  isIndeterminate?: boolean;
}

interface IReviewListProps {
  label: string;
  rows: readonly IReviewListRow[];
  /** Sets the inclusion of these rows; a range or Mod+A changes several at once. */
  onIncludedChange: (ids: readonly string[], isIncluded: boolean) => void;
  /** Shows or hides a row's children: Enter on the row or its disclosure. The consumer drops hidden rows. */
  onExpandedChange?: (id: string, isExpanded: boolean) => void;
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
 * anchor row to the anchor's state, and Mod+A includes every row. Shift+↑ and Shift+↓ move the cursor and set the range
 * from the anchor to it the same way. Space is left to the page, such as a player. Rows with a `level` form a tree:
 * Enter or the disclosure shows or hides a row's children, and a row whose children are partly included shows a mixed
 * checkbox.
 */
export function ReviewList({ label, rows, onIncludedChange, onExpandedChange }: IReviewListProps): ReactElement {
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
  const setRange = (row: number, fallbackAnchor = 0): void => {
    const found = rows.findIndex((candidate) => candidate.id === anchorId);
    const anchorIndex = found >= 0 ? found : fallbackAnchor;
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
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && event.shiftKey && !isMod(event)) {
      const next = event.key === "ArrowDown" ? Math.min(rows.length - 1, rowIndex + 1) : Math.max(0, rowIndex - 1);
      if (anchorId === undefined) setAnchorId(current.id);
      focusCell(next, cursor.cell);
      setRange(next, rowIndex);
    } else if (event.key === "ArrowDown") focusCell(Math.min(rows.length - 1, rowIndex + 1), cursor.cell);
    else if (event.key === "ArrowUp") focusCell(Math.max(0, rowIndex - 1), cursor.cell);
    else if (event.key === "Home") focusCell(0, cursor.cell);
    else if (event.key === "End") focusCell(rows.length - 1, cursor.cell);
    else if (event.key === "ArrowRight") focusCell(rowIndex, cursor.cell + 1);
    else if (event.key === "ArrowLeft") focusCell(rowIndex, cursor.cell - 1);
    else if ((TOGGLE_KEYS.has(event.key) && !isMod(event)) || (event.key === " " && event.shiftKey)) toggle(current);
    else if (event.key === "Enter" && current.isExpanded !== undefined && onExpandedChange && !isMod(event))
      onExpandedChange(current.id, !current.isExpanded);
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
  const isTree = rows.some((row) => row.level !== undefined);
  return (
    <div
      data-slot="review-list"
      role={isTree ? "treegrid" : "grid"}
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
            aria-level={isTree ? (row.level ?? 1) : undefined}
            aria-expanded={row.isExpanded}
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
                indeterminate={row.isIndeterminate}
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
              className="flex min-w-0 flex-1 items-start gap-1 outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={isTree ? { paddingInlineStart: `${((row.level ?? 1) - 1) * 1.25}rem` } : undefined}
              onClick={(event) => onRowClick(event, row, index, 1)}
            >
              {isTree && (
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {row.isExpanded !== undefined && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      data-slot="review-list-disclosure"
                      className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent"
                      onClick={(event) => {
                        event.stopPropagation();
                        setCursor({ row: index, cell: 1 });
                        onExpandedChange?.(row.id, !row.isExpanded);
                      }}
                    >
                      <ChevronRightIcon className={cn("size-4 transition-transform", row.isExpanded && "rotate-90")} />
                    </button>
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">{row.content}</div>
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
