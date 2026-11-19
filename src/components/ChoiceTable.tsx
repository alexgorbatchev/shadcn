import {
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../utils/cn.js";

export interface IChoiceTableColumn {
  id: string;
  header: ReactNode;
  /** The column's CSS grid track size, such as `6rem` or `minmax(0, 2fr)`. Defaults to `minmax(0, 1fr)`. */
  width?: string;
  /** Aligns the column's header and cells to the end, for numbers and trailing links. */
  isEnd?: boolean;
}

export interface IChoiceTableRow {
  id: string;
  /** The row's accessible name, such as "SoundCloud · Undertow Signal (Original Mix) · 6:28". */
  label: string;
  /** One cell per column. Give controls inside them `tabIndex={-1}`: the table is one tab stop. */
  cells: readonly ReactNode[];
  /**
   * Full-width content under the row's cells, such as its progress or outcome. Its controls keep their own tab stops,
   * and clicks inside it never change the choice.
   */
  detail?: ReactNode;
}

interface IChoiceTableProps {
  label: string;
  columns: readonly IChoiceTableColumn[];
  rows: readonly IChoiceTableRow[];
  /** The chosen row's ID; no row is chosen while it is undefined or names no row. */
  value: string | undefined;
  /** Chooses a row: ↑/↓, Home, End and a click. */
  onValueChange: (id: string) => void;
  /** Enter on the table confirms the chosen row; focus stays in the table. */
  onConfirm?: (id: string) => void;
  /** The table's focusable element, so a page can move focus to it, such as when results arrive. */
  ref?: Ref<HTMLDivElement>;
}

function isModified(event: KeyboardEvent): boolean {
  return event.altKey || event.metaKey || event.ctrlKey || event.shiftKey;
}

/**
 * A single-choice table, where the highlight is the choice. It is one tab stop: ↑/↓, Home and End choose a row and
 * Enter confirms it, keeping focus in the table; a click chooses a row. Space, ← and → are left to the page, such as a
 * player, and modified keys keep their meaning, such as Mod+Enter for the page's primary action.
 */
export function ChoiceTable({
  label,
  columns,
  rows,
  value,
  onValueChange,
  onConfirm,
  ref,
}: IChoiceTableProps): ReactElement {
  const baseId = useId();
  const rowsRef = useRef(new Map<string, HTMLElement>());
  const chosenIndex = rows.findIndex((row) => row.id === value);
  const rowId = (id: string): string => `${baseId}-${id}`;
  const template: CSSProperties = {
    gridTemplateColumns: columns.map((column) => column.width ?? "minmax(0, 1fr)").join(" "),
  };
  const choose = (index: number): void => {
    const row = rows[index];
    if (!row) return;
    onValueChange(row.id);
    rowsRef.current.get(row.id)?.scrollIntoView({ block: "nearest" });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // Keys pressed in a row's detail belong to its own controls.
    if (event.target !== event.currentTarget || isModified(event) || rows.length === 0) return;
    let handled = true;
    if (event.key === "ArrowDown") choose(chosenIndex < 0 ? 0 : Math.min(rows.length - 1, chosenIndex + 1));
    else if (event.key === "ArrowUp") choose(chosenIndex < 0 ? 0 : Math.max(0, chosenIndex - 1));
    else if (event.key === "Home") choose(0);
    else if (event.key === "End") choose(rows.length - 1);
    else if (event.key === "Enter" && value !== undefined && chosenIndex >= 0) onConfirm?.(value);
    else handled = false;
    if (handled) event.preventDefault();
  };
  const onRowClick = (event: MouseEvent<HTMLElement>, row: IChoiceTableRow): void => {
    if (event.target instanceof Element && event.target.closest("[data-slot='choice-table-detail']")) return;
    onValueChange(row.id);
    event.currentTarget.closest<HTMLElement>("[role='grid']")?.focus({ preventScroll: true });
  };
  return (
    <div
      ref={ref}
      data-slot="choice-table"
      role="grid"
      aria-label={label}
      aria-rowcount={rows.length + 1}
      aria-multiselectable={false}
      aria-activedescendant={chosenIndex >= 0 ? rowId(rows[chosenIndex].id) : undefined}
      tabIndex={0}
      className="group/choice flex min-w-0 flex-col rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onKeyDown={onKeyDown}
    >
      <div
        role="row"
        aria-rowindex={1}
        style={template}
        className="grid items-end gap-x-3 border-b px-3 py-1.5 text-xs text-muted-foreground"
      >
        {columns.map((column) => (
          <div key={column.id} role="columnheader" className={cn("min-w-0", column.isEnd && "text-end")}>
            {column.header}
          </div>
        ))}
      </div>
      {rows.map((row, index) => {
        const isChosen = index === chosenIndex;
        return (
          <div
            key={row.id}
            id={rowId(row.id)}
            ref={(element) => {
              if (element) rowsRef.current.set(row.id, element);
              else rowsRef.current.delete(row.id);
            }}
            role="row"
            aria-rowindex={index + 2}
            aria-selected={isChosen}
            aria-label={row.label}
            data-chosen={isChosen || undefined}
            style={template}
            className={cn(
              "grid cursor-default items-start gap-x-3 gap-y-2 border-b border-l-2 border-l-transparent px-3 py-2",
              isChosen && "border-l-primary bg-accent/60 group-focus-visible/choice:bg-accent",
            )}
            onClick={(event) => onRowClick(event, row)}
          >
            {row.cells.map((cell, cellIndex) => (
              <div
                // eslint-disable-next-line react/no-array-index-key -- cells are positional columns of one row
                key={cellIndex}
                role="gridcell"
                className={cn("min-w-0 break-words", columns[cellIndex]?.isEnd && "text-end")}
              >
                {cell}
              </div>
            ))}
            {row.detail !== undefined && (
              <div data-slot="choice-table-detail" role="gridcell" className="col-span-full min-w-0">
                {row.detail}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
