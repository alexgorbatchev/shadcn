import type { DataGridCursorMove } from "./types.js";

/**
 * The row a cursor move lands on, in displayed order. Without a cursor, moving forward starts at the first row and
 * moving back at the last; moves stop at either end.
 */
export function getDataGridCursorTarget(
  rowIds: readonly string[],
  cursorRowId: string | undefined,
  move: DataGridCursorMove,
  pageSize: number,
): string | undefined {
  if (rowIds.length === 0) return undefined;
  const last = rowIds.length - 1;
  const index = cursorRowId === undefined ? -1 : rowIds.indexOf(cursorRowId);
  const page = Math.max(1, pageSize);
  const target = ((): number => {
    switch (move) {
      case "first":
        return 0;
      case "last":
        return last;
      case "next":
        return index < 0 ? 0 : index + 1;
      case "previous":
        return index < 0 ? last : index - 1;
      case "next-page":
        return index < 0 ? 0 : index + page;
      case "previous-page":
        return index < 0 ? last : index - page;
    }
  })();
  return rowIds[Math.min(last, Math.max(0, target))];
}
