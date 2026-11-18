import type { RowData } from "@tanstack/react-table";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { TableRow } from "../Table.js";
import {
  DataGridCells,
  DataGridColumns,
  DataGridHeaderRows,
  getDataGridColumnLabel,
  type DataGridRow,
  type DataGridTable,
} from "../data-grid/DataGrid.js";
import { useDataGridColumnSizes } from "../data-grid/hooks/useDataGridColumnSizes.js";
import { useDataGridColumnFit } from "../data-grid/hooks/useDataGridColumnFit.js";
import { DataGridColumnFitContext } from "../data-grid/DataGridColumnFitContext.js";
import { VirtualTable, type IVirtualTableRowProps } from "../virtual-table/VirtualTable.js";
import type { DataGridCursorMove, IDataGridRowCursor } from "./types.js";

/** A row's props: spread them onto the row element. With a row cursor they also make the row its keyboard target. */
export interface IVirtualDataGridRowProps extends IVirtualTableRowProps {
  tabIndex?: number;
  "aria-selected"?: boolean;
  "data-cursor"?: "";
  "data-row-id"?: string;
  onFocus?: (event: FocusEvent<HTMLTableRowElement>) => void;
  onClick?: (event: MouseEvent<HTMLTableRowElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTableRowElement>) => void;
}

interface IVirtualDataGridProps<T extends RowData, TSelected> {
  table: DataGridTable<T, TSelected>;
  label: string;
  maxHeight?: number | string;
  /** Fill a bounded parent instead of using maxHeight. */
  height?: "auto" | "fill";
  estimateRowHeight?: number;
  overscan?: number;
  /**
   * Reserve one fill column's native current size and hide optional columns that do not fit, in their chosen order.
   * The fill column may shrink toward `minSize` when only required columns remain. Replaces
   * `meta.visibleFrom` breakpoints; saved visibility and widths are unchanged. Use exactly one fill column, and
   * ensure required columns' minima plus its minimum fit the smallest supported container. Only leaf headers resize.
   * Pair with `fitDataGridColumnSizing` and `constrainDataGridColumnSizing` to preserve preferred widths separately
   * from rendered widths and constrain native pointer resizing.
   */
  fitColumns?: boolean;
  /** Reports usable width; derive the sizing atom with `fitDataGridColumnSizing`, keeping preferences unchanged. */
  onFitWidthChange?: (width: number) => void;
  /** Row IDs that stay rendered while scrolled out of view, such as rows with an open editor. */
  retainedRowIds?: readonly string[];
  /**
   * A row cursor from `useDataGridRowCursor`: the grid becomes one tab stop whose cursor row holds focus, rows set
   * `aria-selected`, and clicks select with Finder's Shift and Mod gestures. Controls inside rows should leave the tab
   * order, since each row is its own keyboard target.
   */
  rowCursor?: IDataGridRowCursor;
  /**
   * Renders one row. Spread `props` onto the row element and render `DataGridCells` inside it; the default renders a
   * plain `TableRow` marked selected while the row is selected.
   */
  renderRow?: (row: DataGridRow<T>, props: IVirtualDataGridRowProps) => ReactNode;
}

interface IRevealRequest {
  rowId: string;
  focus: boolean;
}

const MOVES: Readonly<Record<string, DataGridCursorMove>> = {
  ArrowDown: "next",
  ArrowUp: "previous",
  Home: "first",
  End: "last",
  PageDown: "next-page",
  PageUp: "previous-page",
};

// Clicks on a row's own controls belong to those controls, not to row selection.
const ROW_CONTROLS = "button, a, input, select, textarea, label, [role='checkbox'], [role='radio'], [role='menuitem']";

function renderDefaultRow<T extends RowData>(row: DataGridRow<T>, props: IVirtualDataGridRowProps): ReactElement {
  return (
    <TableRow key={row.id} {...props} data-state={row.getIsSelected() ? "selected" : undefined}>
      <DataGridCells row={row} />
    </TableRow>
  );
}

function handleRowKeys(cursor: IDataGridRowCursor, event: KeyboardEvent<HTMLTableRowElement>): void {
  if (event.target !== event.currentTarget || event.altKey) return;
  const isMod = event.metaKey || event.ctrlKey;
  const move = MOVES[event.key];
  if (move) {
    event.preventDefault();
    cursor.move(move, event.shiftKey ? "extend" : isMod ? "keep" : "follow");
  } else if (event.key === " " && event.shiftKey && !isMod) {
    event.preventDefault();
    cursor.toggle();
  } else if (event.key.toLowerCase() === "a" && isMod && !event.shiftKey) {
    event.preventDefault();
    cursor.selectAll();
  }
}

/**
 * A virtualized, fixed-layout data grid over every filtered and sorted row, without pagination. Columns marked
 * `fill` take the remaining width; the others keep their sizes and can be resized by dragging or from the keyboard.
 * Column widths change through CSS variables, so a `useTable` selector can leave out sizing state and resizing never
 * renders rows again.
 */
export function VirtualDataGrid<T extends RowData, TSelected>({
  table,
  label,
  maxHeight,
  height = "auto",
  estimateRowHeight,
  overscan,
  fitColumns = false,
  onFitWidthChange,
  retainedRowIds,
  rowCursor,
  renderRow = renderDefaultRow,
}: IVirtualDataGridProps<T, TSelected>): ReactElement {
  const scope = useRef<HTMLDivElement>(null);
  useDataGridColumnSizes(table, scope);
  const fit = useDataGridColumnFit(table, scope, fitColumns, onFitWidthChange);
  const hiddenLabels = table
    .getVisibleLeafColumns()
    .filter((column) => fit?.hiddenColumnIds.includes(column.id))
    .map(getDataGridColumnLabel);
  const rows = table.getPrePaginatedRowModel().rows;
  const cursorRowId = rowCursor?.cursorRowId;
  // The cursor row stays rendered while scrolled away, so focus and its tab stop never vanish with virtualization.
  const retained = useMemo(
    () => (cursorRowId === undefined ? retainedRowIds : [...(retainedRowIds ?? []), cursorRowId]),
    [retainedRowIds, cursorRowId],
  );
  const tabStop = rows.some((row) => row.id === cursorRowId) ? cursorRowId : rows[0]?.id;
  const [reveal, setReveal] = useState<IRevealRequest>();
  const latestRows = useRef(rows);
  useEffect(() => {
    latestRows.current = rows;
  });
  useEffect(() => {
    if (!rowCursor) return;
    rowCursor.attach({
      rowIds: () => latestRows.current.map((row) => row.id),
      pageSize: () => {
        const viewport = scope.current?.querySelector<HTMLElement>("[data-testid='VirtualTable']");
        const header = viewport?.querySelector("thead")?.getBoundingClientRect().height ?? 0;
        const row = viewport?.querySelector("tr[data-row-id]")?.getBoundingClientRect().height;
        return viewport && row ? Math.max(1, Math.floor((viewport.clientHeight - header) / row) - 1) : 10;
      },
      reveal: (rowId, focus) => setReveal({ rowId, focus }),
    });
    return () => rowCursor.attach(null);
  }, [rowCursor]);
  useEffect(() => {
    if (!reveal) return;
    const viewport = scope.current?.querySelector<HTMLElement>("[data-testid='VirtualTable']");
    const row = viewport?.querySelector<HTMLElement>(`tr[data-row-id="${CSS.escape(reveal.rowId)}"]`);
    if (!viewport || !row) return;
    // Keep the whole row in view below the sticky header, scrolling as little as possible.
    const header = viewport.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const view = viewport.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    if (bounds.top < view.top + header) viewport.scrollTop -= view.top + header - bounds.top;
    else if (bounds.bottom > view.bottom) viewport.scrollTop += bounds.bottom - view.bottom;
    if (reveal.focus) row.focus({ preventScroll: true });
  }, [reveal]);
  const cursorProps = (row: DataGridRow<T>): Partial<IVirtualDataGridRowProps> =>
    rowCursor
      ? {
          tabIndex: row.id === tabStop ? 0 : -1,
          "aria-selected": row.getIsSelected(),
          "data-cursor": row.id === cursorRowId ? "" : undefined,
          "data-row-id": row.id,
          onFocus: () => rowCursor.setCursor(row.id),
          onClick: (event) => {
            if (event.target instanceof Element && event.target.closest(ROW_CONTROLS)) return;
            rowCursor.pointer(row.id, { shift: event.shiftKey, mod: event.metaKey || event.ctrlKey });
          },
          onKeyDown: (event) => {
            if (rowCursor.keyboard) handleRowKeys(rowCursor, event);
          },
        }
      : {};
  return (
    <div
      ref={scope}
      data-testid="VirtualDataGrid"
      className={height === "fill" ? "flex h-full min-h-0 min-w-0 flex-col" : "min-w-0"}
    >
      <DataGridColumnFitContext value={fit}>
        {hiddenLabels.length > 0 && (
          <div className="mb-2 shrink-0 text-xs text-muted-foreground">
            <p>Hidden to fit: {hiddenLabels.join(", ")}.</p>
            <p>Widen the table or choose fewer columns. Move a column earlier to prioritize it.</p>
          </div>
        )}
        <VirtualTable
          items={rows}
          getItemKey={(row) => row.id}
          label={label}
          maxHeight={maxHeight}
          height={height}
          estimateRowHeight={estimateRowHeight}
          overscan={overscan}
          retainedKeys={retained}
          isRowGrid={rowCursor !== undefined}
          columns={<DataGridColumns table={table} />}
          header={<DataGridHeaderRows table={table} isResizable />}
          renderRow={(row, props) => renderRow(row, { ...props, ...cursorProps(row) })}
        />
      </DataGridColumnFitContext>
    </div>
  );
}
