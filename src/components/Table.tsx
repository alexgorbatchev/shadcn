import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../utils/cn";

type TableProps = ComponentProps<"table"> & IDensityProps;

function Table({ density, className, dir, ...props }: TableProps): ReactElement {
  return (
    <div data-density={density} data-slot="table-container" dir={dir} className="relative w-full overflow-x-auto">
      <table data-slot="table" dir={dir} className={cn("w-full caption-bottom text-sm", className)} {...props} />
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

type TableHeadProps = ComponentProps<"th"> & IDensityProps;

function TableHead({ density, className, ...props }: TableHeadProps): ReactElement {
  return (
    <th
      data-density={density}
      data-slot="table-head"
      className={cn(
        "h-control-lg px-control-x text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = ComponentProps<"td"> & IDensityProps;

function TableCell({ density, className, ...props }: TableCellProps): ReactElement {
  return (
    <td
      data-density={density}
      data-slot="table-cell"
      className={cn(
        "px-control-x py-control-gap align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
        className,
      )}
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

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
