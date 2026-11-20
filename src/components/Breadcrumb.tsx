import { useLinkAnalyticsCallback } from "../hooks/useLinkAnalyticsCallback.js";
import type { IAnalyticsProps } from "../analytics/types.js";
import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../utils/cn.js";

type BreadcrumbProps = ComponentProps<"nav"> & IDensityProps;

function Breadcrumb({ density, className, ...props }: BreadcrumbProps): ReactElement {
  return (
    <nav aria-label="breadcrumb" data-density={density} data-slot="breadcrumb" className={cn(className)} {...props} />
  );
}

type BreadcrumbListProps = ComponentProps<"ol"> &
  IDensityProps & {
    /**
     * `wrap` (the default) lets a long path break onto more lines. `truncate` keeps the path on one line: every item
     * shrinks and ends in an ellipsis, longer items giving up more width, while separators keep their size. Give each
     * truncated item its full text as a tooltip or accessible name.
     */
    overflow?: "wrap" | "truncate";
  };

function BreadcrumbList({ density, overflow = "wrap", className, ...props }: BreadcrumbListProps): ReactElement {
  return (
    <ol
      data-density={density}
      data-slot="breadcrumb-list"
      data-overflow={overflow}
      className={cn(
        "flex items-center gap-control-gap text-sm text-muted-foreground",
        overflow === "wrap"
          ? "flex-wrap wrap-break-word"
          : "min-w-0 flex-nowrap overflow-hidden whitespace-nowrap [&>li]:min-w-0 [&>li>*]:min-w-0 [&>li>*]:truncate [&>li[data-slot=breadcrumb-separator]]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

type BreadcrumbItemProps = ComponentProps<"li"> & IDensityProps;

function BreadcrumbItem({ density, className, ...props }: BreadcrumbItemProps): ReactElement {
  return (
    <li
      data-density={density}
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

type BreadcrumbLinkProps = IAnalyticsProps & useRender.ComponentProps<"a"> & IDensityProps;

function BreadcrumbLink({ analytics, density, className, render, ...props }: BreadcrumbLinkProps): ReactElement {
  const onClick = useLinkAnalyticsCallback("BreadcrumbLink", analytics, props.onClick, render !== undefined);
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn("transition-colors hover:text-foreground", className),
      },
      { ...props, onClick },
    ),
    render,
    state: {
      density,
      slot: "breadcrumb-link",
    },
  });
}

type BreadcrumbPageProps = ComponentProps<"span"> & IDensityProps;

function BreadcrumbPage({ density, className, ...props }: BreadcrumbPageProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

type BreadcrumbSeparatorProps = ComponentProps<"li"> & IDensityProps;

function BreadcrumbSeparator({ density, children, className, ...props }: BreadcrumbSeparatorProps): ReactElement {
  return (
    <li
      data-density={density}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="rtl:rotate-180" />}
    </li>
  );
}

type BreadcrumbEllipsisProps = ComponentProps<"span"> & IDensityProps;

function BreadcrumbEllipsis({ density, className, ...props }: BreadcrumbEllipsisProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-5 items-center justify-center [&>svg]:size-4", className)}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
