import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn.js";

type DescriptionListProps = ComponentProps<"dl"> & IDensityProps;

/**
 * A stacked description list: each item puts its term on one line and its details under it, full width, in reading
 * order at every width. Use it for question-and-answer summaries and other term/value pairs whose terms can be long.
 */
function DescriptionList({ density, className, ...props }: DescriptionListProps): ReactElement {
  return (
    <dl
      data-density={density}
      data-slot="description-list"
      className={cn("flex w-full min-w-0 flex-col gap-panel text-sm", className)}
      {...props}
    />
  );
}

type DescriptionListItemProps = ComponentProps<"div"> & IDensityProps;

/** One term and its details; HTML allows a `div` to group them inside a `dl`. */
function DescriptionListItem({ density, className, ...props }: DescriptionListItemProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="description-list-item"
      className={cn("flex min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

type DescriptionTermProps = ComponentProps<"dt"> & IDensityProps;

function DescriptionTerm({ density, className, ...props }: DescriptionTermProps): ReactElement {
  return (
    <dt
      data-density={density}
      data-slot="description-term"
      className={cn("min-w-0 font-medium break-words text-muted-foreground", className)}
      {...props}
    />
  );
}

type DescriptionDetailsProps = ComponentProps<"dd"> & IDensityProps;

/** The details keep their line breaks, so multi-line text reads as it was written. */
function DescriptionDetails({ density, className, ...props }: DescriptionDetailsProps): ReactElement {
  return (
    <dd
      data-density={density}
      data-slot="description-details"
      className={cn("min-w-0 break-words whitespace-pre-wrap text-foreground", className)}
      {...props}
    />
  );
}

export { DescriptionList, DescriptionListItem, DescriptionTerm, DescriptionDetails };
export type { DescriptionListProps, DescriptionListItemProps, DescriptionTermProps, DescriptionDetailsProps };
