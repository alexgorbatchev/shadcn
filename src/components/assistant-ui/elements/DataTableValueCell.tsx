import type { JSX } from "react";
import type { IDataTableColumn, DataTableRow } from "../utils/dataTable/types.js";
import { cn } from "../../../utils/cn.js";
import { safeHref } from "../utils/href.js";
import { DATE_ONLY } from "../utils/dataTable/constants.js";
import {
  isEmpty,
  textValue,
  numericValue,
  formatted,
  numberOptions,
  withUnit,
  fractionDigits,
  asDate,
  relativeDate,
} from "../utils/dataTableUtils.js";
import { Badge } from "../../Badge.js";
export function DataTableValueCell({ column, row, locale, relativeTo }: IDataTableValueCellProps): JSX.Element {
  const value = row[column.key];
  if (isEmpty(value)) return <span className="text-muted-foreground">none</span>;
  const format = column.format ?? { kind: "text" as const };
  if (format.kind === "number") {
    const number = numericValue(value);
    if (number === undefined) return <>{textValue(value)}</>;
    const content = formatted(value, () =>
      new Intl.NumberFormat(locale, numberOptions(format.decimals, format.compact === true)).format(number),
    );
    return <>{withUnit(content, format.unit)}</>;
  }
  if (format.kind === "currency") {
    const number = numericValue(value);
    if (number === undefined) return <>{textValue(value)}</>;
    return (
      <>
        {formatted(value, () =>
          new Intl.NumberFormat(locale, {
            style: "currency",
            currency: format.currency,
            ...numberOptions(format.decimals, format.compact === true),
          }).format(number),
        )}
      </>
    );
  }
  if (format.kind === "percent") {
    const number = numericValue(value);
    if (number === undefined) return <>{textValue(value)}</>;
    return (
      <>
        {formatted(value, () =>
          new Intl.NumberFormat(locale, {
            style: "percent",
            ...fractionDigits(format.decimals),
          }).format(format.basis === "unit" ? number / 100 : number),
        )}
      </>
    );
  }
  if (format.kind === "delta") {
    const number = numericValue(value);
    if (number === undefined) return <>{textValue(value)}</>;
    const direction = number > 0 ? "↑" : number < 0 ? "↓" : "→";
    const good = number === 0 || number > 0 === (format.upIsGood ?? true);
    const content = formatted(value, () =>
      new Intl.NumberFormat(locale, {
        signDisplay: "never",
        ...fractionDigits(format.decimals),
      }).format(number),
    );
    return (
      <span
        className={cn(
          number === 0
            ? "text-muted-foreground"
            : good
              ? "text-success text-success"
              : "text-destructive text-destructive",
        )}
      >
        {direction} {withUnit(content, format.unit)}
      </span>
    );
  }
  if (format.kind === "date") {
    const date = asDate(value);
    if (!date) return <>{textValue(value)}</>;
    const style = format.style ?? "date";
    const content = formatted(value, () =>
      style === "relative" && relativeTo !== undefined
        ? relativeDate(date, locale, relativeTo)
        : new Intl.DateTimeFormat(
            locale,
            style === "datetime"
              ? { dateStyle: "medium", timeStyle: "short" }
              : {
                  dateStyle: "medium",
                  ...((style === "relative" && relativeTo === undefined) ||
                  (typeof value === "string" && DATE_ONLY.test(value))
                    ? { timeZone: "UTC" }
                    : {}),
                },
          ).format(date),
    );
    return <span title={date.toISOString()}>{content}</span>;
  }
  if (format.kind === "boolean") {
    if (typeof value !== "boolean") return <>{textValue(value)}</>;
    return <>{value ? (format.trueLabel ?? "Yes") : (format.falseLabel ?? "No")}</>;
  }
  if (format.kind === "link") {
    const hrefValue = format.hrefKey ? row[format.hrefKey] : value;
    const href = safeHref(typeof hrefValue === "string" ? hrefValue : undefined);
    if (!href) return <>{textValue(value)}</>;
    const external = /^https?:/.test(href);
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
        {textValue(value)}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <a href={href} className="underline underline-offset-2">
        {textValue(value)}
      </a>
    );
  }
  if (format.kind === "badge") {
    const tone = format.tones?.[textValue(value)] ?? "neutral";
    return (
      <Badge variant={tone === "danger" ? "destructive" : tone === "neutral" ? "secondary" : tone}>
        {textValue(value)}
      </Badge>
    );
  }
  if (format.kind === "list" && Array.isArray(value)) {
    const max = Math.max(0, Math.floor(format.max ?? value.length));
    const shown = value.slice(0, max);
    return (
      <span className="flex flex-wrap gap-1">
        {shown.map((item, index) => (
          <Badge key={index} variant="secondary">
            {item}
          </Badge>
        ))}
        {value.length > shown.length ? (
          <span className="text-muted-foreground px-1.5 py-0.5 text-sm">+{value.length - shown.length}</span>
        ) : null}
      </span>
    );
  }
  return <>{textValue(value)}</>;
}
interface IDataTableValueCellProps {
  column: IDataTableColumn;
  row: DataTableRow;
  locale: string;
  relativeTo: number | undefined;
}
