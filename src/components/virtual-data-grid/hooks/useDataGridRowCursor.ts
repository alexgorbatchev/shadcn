import type { RowData, RowSelectionState } from "@tanstack/react-table";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { DataGridTable } from "../../data-grid/DataGrid.js";
import { getDataGridCursorTarget } from "../getDataGridCursorTarget.js";
import { getDataGridRowRange } from "../getDataGridRowRange.js";
import type {
  DataGridSelectionGesture,
  IDataGridRowCursor,
  IDataGridRowCursorOptions,
  IDataGridRowNavigation,
} from "../types.js";

function selectedIds(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((id) => selection[id]);
}

/**
 * A row cursor with Finder-style selection for `VirtualDataGrid` (pass it as `rowCursor`). The grid becomes one tab
 * stop whose cursor row holds focus; a click selects one row and sets the range anchor, Shift+click selects the
 * displayed range from the anchor, Mod+click toggles a row and Mod+Shift+click adds a range. The cursor's methods run
 * the keyboard gestures, which rows also handle themselves unless `keyboard` is off.
 */
export function useDataGridRowCursor<T extends RowData, TSelected>(
  table: DataGridTable<T, TSelected>,
  options: IDataGridRowCursorOptions = {},
): IDataGridRowCursor {
  const [cursorRowId, setCursorRowId] = useState<string>();
  const [ownAnchor, setOwnAnchor] = useState<string>();
  const isOwned = options.onSelectionChange !== undefined;
  const anchorRowId = isOwned ? options.anchorRowId : ownAnchor;
  const navigation = useRef<IDataGridRowNavigation | null>(null);
  // Methods read the latest render's state, so the cursor object stays stable for its consumers' memos.
  const latest = useRef({ table, options, cursorRowId, anchorRowId, isOwned });
  useLayoutEffect(() => {
    latest.current = { table, options, cursorRowId, anchorRowId, isOwned };
  });
  const methods = useMemo(() => {
    const rowIds = (): string[] =>
      navigation.current?.rowIds() ?? latest.current.table.getPrePaginatedRowModel().rows.map((row) => row.id);
    const moveCursor = (rowId: string | undefined, focus: boolean): void => {
      latest.current.cursorRowId = rowId;
      setCursorRowId(rowId);
      latest.current.options.onCursorChange?.(rowId);
      if (rowId !== undefined) navigation.current?.reveal(rowId, focus);
    };
    const select = (ids: string[], anchor: string | undefined, gesture: DataGridSelectionGesture): void => {
      const current = latest.current;
      if (current.isOwned) {
        current.options.onSelectionChange?.({ rowIds: ids, anchorRowId: anchor, gesture });
        return;
      }
      current.anchorRowId = anchor;
      setOwnAnchor(anchor);
      current.table.setRowSelection(Object.fromEntries(ids.map((id) => [id, true] as const)));
    };
    const selection = (): string[] => selectedIds(latest.current.table.atoms.rowSelection.get());
    return {
      move: (move, mode = "follow") => {
        const { cursorRowId: from, anchorRowId: anchor } = latest.current;
        const target = getDataGridCursorTarget(rowIds(), from, move, navigation.current?.pageSize() ?? 10);
        if (target === undefined) return;
        moveCursor(target, true);
        if (mode === "follow" && selection().length <= 1) select([target], target, "follow");
        else if (mode === "extend") {
          const start = anchor ?? from ?? target;
          select(getDataGridRowRange(rowIds(), start, target), start, "extend");
        }
      },
      toggle: () => {
        const rowId = latest.current.cursorRowId;
        if (rowId === undefined) return;
        const current = selection();
        select(current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId], rowId, "toggle");
      },
      selectAll: () => {
        const visible = latest.current.table.getFilteredRowModel().flatRows.filter((row) => row.getCanSelect());
        const ids = [...new Set([...selection(), ...visible.map((row) => row.id)])];
        select(ids, latest.current.anchorRowId, "all");
      },
      clear: () => select([], undefined, "clear"),
      pointer: (rowId, { shift, mod }) => {
        const { cursorRowId: from, anchorRowId: anchor } = latest.current;
        moveCursor(rowId, false);
        if (shift) {
          const start = anchor ?? from ?? rowIds()[0];
          const range = getDataGridRowRange(rowIds(), start, rowId);
          select(mod ? [...new Set([...selection(), ...range])] : range, start, mod ? "add-range" : "range");
        } else if (mod) {
          const current = selection();
          select(current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId], rowId, "toggle");
        } else select([rowId], rowId, "select");
      },
      setCursor: (rowId) => {
        if (rowId === latest.current.cursorRowId) return;
        latest.current.cursorRowId = rowId;
        setCursorRowId(rowId);
        latest.current.options.onCursorChange?.(rowId);
      },
      reveal: ({ focus = true } = {}) => {
        const rowId = latest.current.cursorRowId;
        if (rowId !== undefined) navigation.current?.reveal(rowId, focus);
      },
      attach: (next: IDataGridRowNavigation | null) => {
        navigation.current = next;
      },
    } satisfies Omit<IDataGridRowCursor, "cursorRowId" | "anchorRowId" | "keyboard">;
  }, []);
  const keyboard = options.keyboard ?? true;
  return useMemo(
    () => ({ ...methods, cursorRowId, anchorRowId, keyboard }),
    [methods, cursorRowId, anchorRowId, keyboard],
  );
}
