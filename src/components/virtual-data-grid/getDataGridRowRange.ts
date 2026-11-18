/** The rows from one row to another in displayed order, inclusive, whichever comes first; a missing end is one row. */
export function getDataGridRowRange(
  rowIds: readonly string[],
  fromRowId: string | undefined,
  toRowId: string,
): string[] {
  const to = rowIds.indexOf(toRowId);
  if (to < 0) return [];
  const from = fromRowId === undefined ? -1 : rowIds.indexOf(fromRowId);
  if (from < 0) return [toRowId];
  return rowIds.slice(Math.min(from, to), Math.max(from, to) + 1);
}
