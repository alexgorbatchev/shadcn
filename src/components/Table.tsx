import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../utils/cn.js";

type TableProps = ComponentProps<"table"> & IDensityProps & { layout?: "auto" | "fixed" };

function Table({ density, className, dir, layout = "auto", ...props }: TableProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="table-container"
      dir={dir}
      className={cn(
        "@container/table relative min-w-0 w-full",
        layout === "fixed" ? "overflow-x-hidden" : "overflow-x-auto",
      )}
    >
      <table
        data-slot="table"
        dir={dir}
        className={cn("w-full caption-bottom text-sm", layout === "fixed" && "table-fixed", className)}
        {...props}
      />
    </div>
  );
}

type TableHeaderProps = ComponentProps<"thead"> & IDensityProps;

function TableHeader({ density, className, ...props }: TableHeaderProps): ReactElement {
  return (
    <thead data-density={density} data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
  );
}

type TableBodyProps = ComponentProps<"tbody"> & IDensityProps;

function TableBody({ density, className, ...props }: TableBodyProps): ReactElement {
  return (
    <tbody
      data-density={density}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

type TableFooterProps = ComponentProps<"tfoot"> & IDensityProps;

function TableFooter({ density, className, ...props }: TableFooterProps): ReactElement {
  return (
    <tfoot
      data-density={density}
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

type TableRowProps = ComponentProps<"tr"> & IDensityProps;

function TableRow({ density, className, ...props }: TableRowProps): ReactElement {
  return (
    <tr
      data-density={density}
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

type TableTextAlign = "start" | "center" | "end";
const alignmentClasses: Record<TableTextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};
type TableVisibility = "sm" | "lg" | "container-sm" | "container-md";
const visibilityClasses: Record<TableVisibility, string> = {
  sm: "hidden sm:table-cell",
  lg: "hidden lg:table-cell",
  "container-sm": "hidden @min-[400px]/table:table-cell",
  "container-md": "hidden @min-[480px]/table:table-cell",
};
// Columns resolve visibility against the same table container as their cells, so a hidden column never keeps width.
const columnVisibilityClasses: Record<TableVisibility, string> = {
  sm: "hidden sm:table-column",
  lg: "hidden lg:table-column",
  "container-sm": "hidden @min-[400px]/table:table-column",
  "container-md": "hidden @min-[480px]/table:table-column",
};
interface ITableCellOptions {
  truncate?: boolean;
  textAlign?: TableTextAlign;
  visibleFrom?: TableVisibility;
}

type TableHeadProps = ComponentProps<"th"> & IDensityProps & ITableCellOptions;

function TableHead({
  density,
  className,
  truncate = false,
  textAlign = "start",
  visibleFrom,
  ...props
}: TableHeadProps): ReactElement {
  return (
    <th
      data-density={density}
      data-slot="table-head"
      className={cn(
        "h-control-lg px-control-x align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0",
        alignmentClasses[textAlign],
        truncate && "truncate",
        visibleFrom && visibilityClasses[visibleFrom],
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = ComponentProps<"td"> & IDensityProps & ITableCellOptions;

function TableCell({
  density,
  className,
  truncate = false,
  textAlign,
  visibleFrom,
  ...props
}: TableCellProps): ReactElement {
  return (
    <td
      data-density={density}
      data-slot="table-cell"
      className={cn(
        "px-control-x py-control-gap align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
        textAlign && alignmentClasses[textAlign],
        truncate && "truncate",
        visibleFrom && visibilityClasses[visibleFrom],
        className,
      )}
      {...props}
    />
  );
}

type TableColumnGroupProps = ComponentProps<"colgroup">;

function TableColumnGroup(props: TableColumnGroupProps): ReactElement {
  return <colgroup data-slot="table-column-group" {...props} />;
}

type TableColumnProps = ComponentProps<"col"> &
  Pick<ITableCellOptions, "visibleFrom"> & {
    /** Fixed column width; numbers are pixels. Columns without one share the remaining width. */
    width?: number | string;
  };

/** A column; give it the same `visibleFrom` as its header and cells. */
function TableColumn({ className, style, visibleFrom, width, ...props }: TableColumnProps): ReactElement {
  return (
    <col
      data-slot="table-column"
      className={cn(visibleFrom && columnVisibilityClasses[visibleFrom], className)}
      style={width === undefined ? style : { ...style, width }}
      {...props}
    />
  );
}

type TableCaptionProps = ComponentProps<"caption"> & IDensityProps;

function TableCaption({ density, className, ...props }: TableCaptionProps): ReactElement {
  return (
    <caption
      data-density={density}
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableColumnGroup,
  TableColumn,
};
