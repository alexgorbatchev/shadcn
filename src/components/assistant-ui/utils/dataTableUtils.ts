import type { DataTableValue, DataTableRow, DataTableFormat, IDataTableColumn } from "./dataTable/types.js";
import { ISO_DATE } from "./dataTable/constants.js";
import { clamp } from "./range.js";
export const isEmpty = (value: DataTableValue): value is null | undefined => value === null || value === undefined;
export const textValue = (value: Exclude<DataTableValue, null | undefined>): string =>
  Array.isArray(value) ? value.join(", ") : String(value);
export const isCalendarDate = (value: string): boolean => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth =
    month === 2
      ? year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
        ? 29
        : 28
      : [4, 6, 9, 11].includes(month)
        ? 30
        : 31;
  return day <= daysInMonth;
};
export const asDate = (value: DataTableValue): Date | undefined => {
  const timestamp =
    typeof value === "number"
      ? value
      : typeof value === "string" && ISO_DATE.test(value) && isCalendarDate(value)
        ? Date.parse(value)
        : Number.NaN;
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp);
};
export const fractionDigits = (decimals: number | undefined): Intl.NumberFormatOptions =>
  decimals === undefined || !Number.isFinite(decimals)
    ? {}
    : {
        minimumFractionDigits: Math.floor(clamp(decimals, 0, 20)),
        maximumFractionDigits: Math.floor(clamp(decimals, 0, 20)),
      };
export const numberOptions = (decimals: number | undefined, compact: boolean): Intl.NumberFormatOptions => ({
  notation: compact ? ("compact" as const) : ("standard" as const),
  ...fractionDigits(decimals),
});
/**
 * Formats with Intl, falling back to the raw value: a model can send a
 * currency code or locale that Intl rejects by throwing.
 */
export const formatted = (value: Exclude<DataTableValue, null | undefined>, format: () => string): string => {
  try {
    return format();
  } catch {
    return textValue(value);
  }
};
export const numericValue = (value: DataTableValue): number | undefined =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined;
export const relativeDate = (date: Date, locale: string, relativeTo: number): string => {
  const seconds = Math.round((date.getTime() - relativeTo) / 1000);
  const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, amount] = units.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(seconds / amount), unit);
};
export const relativeRefreshDelay = (
  columns: readonly IDataTableColumn[],
  rows: readonly DataTableRow[],
  now: number,
): number => {
  const relativeKeys = columns
    .filter((column) => column.format?.kind === "date" && column.format.style === "relative")
    .map((column) => column.key);
  const freshestAge = rows.reduce((minimum, row) => {
    for (const key of relativeKeys) {
      const date = asDate(row[key]);
      if (date) minimum = Math.min(minimum, Math.abs(now - date.getTime()));
    }
    return minimum;
  }, Number.POSITIVE_INFINITY);
  if (freshestAge < 60000) return 1000;
  if (freshestAge < 3600000) return 30000;
  if (freshestAge < 86400000) return 60000;
  if (freshestAge < 604800000) return 3600000;
  return 86400000;
};
export const withUnit = (text: string, unit: string | undefined): string =>
  unit === undefined || unit === "" ? text : /^[%‰°]/.test(unit) ? `${text}${unit}` : `${text} ${unit}`;
export const isNumeric = (format: DataTableFormat | undefined): boolean =>
  format?.kind === "number" || format?.kind === "currency" || format?.kind === "percent" || format?.kind === "delta";
export const compareValues = (
  a: DataTableValue,
  b: DataTableValue,
  column: IDataTableColumn,
  collator: Intl.Collator,
): number => {
  if (isEmpty(a)) return isEmpty(b) ? 0 : 1;
  if (isEmpty(b)) return -1;
  if (column.format?.kind === "date") {
    const first = asDate(a);
    const second = asDate(b);
    if (first && second) return first.getTime() - second.getTime();
  }
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length - b.length;
  return collator.compare(textValue(a), textValue(b));
};
export const collatorFor = (locale: string): Intl.Collator => {
  try {
    return new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  } catch {
    return new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });
  }
};
export const rowIdentifier = (row: DataTableRow, key: string | undefined, index: number): string | number => {
  const value = key === undefined ? undefined : row[key];
  return value === null || value === undefined ? index : textValue(value);
};
