import type { DataGridColumnFilter } from "./DataGrid.js";
import { readDataGridOptionValues } from "./readDataGridOptionValues.js";
import { readDataGridRange } from "./readDataGridRange.js";

/**
 * Describes a filter value in a few words: `120–128`, `≥ 120`, or `≤ 128` for a range, and the chosen option labels for
 * options. Values without a matching option read as themselves. Returns an empty string for a value that filters
 * nothing.
 */
function describeDataGridFilter(filter: DataGridColumnFilter, value: unknown, locale?: string): string {
  if (filter.variant === "options") {
    return readDataGridOptionValues(value)
      .map((item) => filter.options.find((option) => option.value === item)?.label ?? item)
      .join(", ");
  }
  const formatter = new Intl.NumberFormat(locale, filter.format);
  const [min, max] = readDataGridRange(value);
  // `inNumberRange` swaps reversed bounds, so the description reads them in the order they filter.
  if (min !== null && max !== null)
    return `${formatter.format(Math.min(min, max))}–${formatter.format(Math.max(min, max))}`;
  if (min !== null) return `≥ ${formatter.format(min)}`;
  if (max !== null) return `≤ ${formatter.format(max)}`;
  return "";
}

export { describeDataGridFilter };
