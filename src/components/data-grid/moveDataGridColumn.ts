/**
 * Swaps `columnId` with its neighbour among `movableIds` in `order`, leaving every other column where it is.
 * Returns `order` unchanged when the column is already at that end or is not movable.
 */
export function moveDataGridColumn(
  order: readonly string[],
  movableIds: readonly string[],
  columnId: string,
  offset: -1 | 1,
): string[] {
  const index = movableIds.indexOf(columnId);
  const neighbour = index < 0 ? undefined : movableIds[index + offset];
  if (neighbour === undefined) return [...order];
  return order.map((id) => (id === columnId ? neighbour : id === neighbour ? columnId : id));
}
