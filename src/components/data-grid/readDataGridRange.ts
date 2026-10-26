/** A range filter's bounds; `null` leaves that end open. */
type DataGridRange = readonly [min: number | null, max: number | null];

const OPEN_RANGE: DataGridRange = [null, null];

function readBound(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Reads a range filter value, treating anything other than a two-item array of finite numbers or nulls as open. */
function readDataGridRange(value: unknown): DataGridRange {
  if (!Array.isArray(value) || value.length !== 2) return OPEN_RANGE;
  return [readBound(value[0]), readBound(value[1])];
}

export { readDataGridRange };
export type { DataGridRange };
