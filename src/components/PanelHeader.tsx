import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";

type PanelHeaderProps = IDensityProps &
  Omit<ComponentProps<"header">, "title" | "children"> & {
    /** The panel's name, rendered as its heading. */
    title: ReactNode;
    /** A count shown after the title in muted text, such as the number of comments. */
    count?: ReactNode;
    /** Heading level for the title; panels beside a page's `h1` use `h2` (the default). */
    headingLevel?: 2 | 3;
    /** Props for the heading element, such as a ref and `tabIndex` to move focus to the panel. */
    headingProps?: Omit<ComponentProps<"h2">, "children">;
    /** Icon buttons at the end of the heading row, such as close or expand. Keep them to icon-sized buttons. */
    actions?: ReactNode;
    /** The panel's primary and secondary actions, laid out as one row under the heading that wraps as a group. */
    toolbar?: ReactNode;
  };

/**
 * A side panel or drawer header: one heading row with the title, an optional count and trailing icon buttons, and an
 * optional action row beneath it. Both rows use control-height bands so the heading lines up with neighbouring headers.
 */
function PanelHeader({
  title,
  count,
  headingLevel = 2,
  headingProps,
  actions,
  toolbar,
  density,
  className,
  ...props
}: PanelHeaderProps): ReactElement {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <header
      data-density={density}
      data-slot="panel-header"
      data-scroll="none"
      className={cn("flex min-w-0 flex-col gap-panel-sm", className)}
      {...props}
    >
      <div data-slot="panel-header-title-row" className="flex min-h-control min-w-0 items-center justify-between gap-2">
        <Heading
          data-slot="panel-header-title"
          {...headingProps}
          className={cn("min-w-0 truncate text-lg font-semibold text-foreground outline-none", headingProps?.className)}
        >
          {title}
          {count != null && (
            <>
              {" "}
              <span data-slot="panel-header-count" className="ms-1 font-normal text-muted-foreground tabular-nums">
                {count}
              </span>
            </>
          )}
        </Heading>
        {actions != null && (
          <div data-slot="panel-header-actions" className="flex shrink-0 items-center gap-1">
            {actions}
          </div>
        )}
      </div>
      {toolbar != null && (
        <div data-slot="panel-header-toolbar" className="flex min-w-0 flex-wrap items-center gap-control-gap">
          {toolbar}
        </div>
      )}
    </header>
  );
}

export { PanelHeader };
export type { PanelHeaderProps };
