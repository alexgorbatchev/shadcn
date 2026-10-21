import type { ComponentProps } from "react";
export type DataTableValue = string | number | boolean | null | undefined | readonly (string | number)[];
export type DataTableRow = Readonly<Record<string, DataTableValue>>;
export type DataTableFormat =
  | {
      kind: "text";
    }
  | {
      kind: "number";
      decimals?: number | undefined;
      compact?: boolean | undefined;
      unit?: string | undefined;
    }
  | {
      kind: "currency";
      currency: string;
      decimals?: number | undefined;
      compact?: boolean | undefined;
    }
  | {
      kind: "percent";
      decimals?: number | undefined;
      basis?: "fraction" | "unit" | undefined;
    }
  | {
      kind: "delta";
      decimals?: number | undefined;
      unit?: string | undefined;
      upIsGood?: boolean | undefined;
    }
  | {
      kind: "date";
      style?: "date" | "datetime" | "relative" | undefined;
    }
  | {
      kind: "boolean";
      trueLabel?: string | undefined;
      falseLabel?: string | undefined;
    }
  | {
      kind: "link";
      hrefKey?: string | undefined;
    }
  | {
      kind: "badge";
      tones?: Readonly<Record<string, "neutral" | "success" | "warning" | "danger">> | undefined;
    }
  | {
      kind: "list";
      max?: number | undefined;
    };
export interface IDataTableColumn {
  key: string;
  label: string;
  format?: DataTableFormat | undefined;
  align?: "start" | "end" | undefined;
  sortable?: boolean | undefined;
  priority?: "primary" | "secondary" | undefined;
  width?: string | undefined;
}
export interface IDataTableSort {
  key: string;
  direction: "asc" | "desc";
}
export interface IDataTableProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  columns: readonly IDataTableColumn[];
  rows: readonly DataTableRow[];
  rowKey?: string | undefined;
  caption?: string | undefined;
  defaultSort?: IDataTableSort | undefined;
  sort?: IDataTableSort | null | undefined;
  onSortChange?: ((sort: IDataTableSort | null) => void) | undefined;
  locale?: string | undefined;
  emptyMessage?: string | undefined;
  relativeTo?: number | undefined;
}
