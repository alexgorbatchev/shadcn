import type { IDensityProps } from "../density/types.js";
import { createContext, useContext } from "react";
import type { ComponentProps, ReactElement } from "react";
import type { StackDirection } from "../layout/types.js";
import { cn } from "../utils/cn.js";

const DescriptionListOrientationContext = createContext<StackDirection>("vertical");

type DescriptionListProps = ComponentProps<"dl"> &
  IDensityProps & {
    /**
     * `vertical` (the default) stacks each term above its details. `horizontal` puts the term at the start and the
     * details at the end of one row, for short pairs such as a shortcut and its keys; a row too narrow for both wraps.
     */
    orientation?: StackDirection;
  };

/**
 * A description list. Stacked by default: each item puts its term on one line and its details under it, full width,
 * in reading order at every width, for question-and-answer summaries and other pairs whose terms can be long.
 */
function DescriptionList({
  density,
  orientation = "vertical",
  className,
  ...props
}: DescriptionListProps): ReactElement {
  return (
    <DescriptionListOrientationContext.Provider value={orientation}>
      <dl
        data-density={density}
        data-slot="description-list"
        data-orientation={orientation}
        className={cn(
          "flex w-full min-w-0 flex-col text-sm",
          orientation === "horizontal" ? "gap-2" : "gap-panel",
          className,
        )}
        {...props}
      />
    </DescriptionListOrientationContext.Provider>
  );
}

type DescriptionListItemProps = ComponentProps<"div"> & IDensityProps;

/** One term and its details; HTML allows a `div` to group them inside a `dl`. */
function DescriptionListItem({ density, className, ...props }: DescriptionListItemProps): ReactElement {
  const orientation = useContext(DescriptionListOrientationContext);
  return (
    <div
      data-density={density}
      data-slot="description-list-item"
      className={cn(
        "flex min-w-0",
        orientation === "horizontal" ? "flex-wrap items-center justify-between gap-x-4 gap-y-1" : "flex-col gap-1",
        className,
      )}
      {...props}
    />
  );
}

type DescriptionTermProps = ComponentProps<"dt"> &
  IDensityProps & {
    /** `muted` (the default) suits a question above its answer; `default` suits a label that is the primary text. */
    tone?: "muted" | "default";
  };

function DescriptionTerm({ density, tone = "muted", className, ...props }: DescriptionTermProps): ReactElement {
  return (
    <dt
      data-density={density}
      data-slot="description-term"
      className={cn(
        "min-w-0 font-medium break-words",
        tone === "muted" ? "text-muted-foreground" : "text-foreground",
        className,
      )}
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
