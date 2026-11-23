import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";
import { Heading } from "./Heading.js";
import type { HeadingSize } from "./Heading.js";
type PageHeaderProps = IDensityProps & {
  title: string;
  /** The title's visual size. Defaults to `xl`; a page's own title can take a display size such as `3xl`. */
  titleSize?: HeadingSize;
  /** Props for the title's `h1`, such as a `ref` and `tabIndex={-1}` so the app can move focus to it. */
  headingProps?: Omit<ComponentProps<"h1">, "children">;
  /** Context above the page title without introducing another heading. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};
function PageHeader({
  title,
  titleSize = "xl",
  headingProps,
  eyebrow,
  description,
  breadcrumbs,
  actions,
  density,
}: PageHeaderProps): ReactElement {
  return (
    <header
      data-density={density}
      data-slot="page-header"
      data-scroll="none"
      className="flex min-w-0 flex-col gap-field-gap"
    >
      {breadcrumbs}
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-panel">
        <div className="min-w-0">
          {eyebrow != null && (
            <div className="mb-2 text-xs font-medium tracking-widest text-muted-foreground">{eyebrow}</div>
          )}
          <Heading level={1} size={titleSize} {...headingProps} className={cn("outline-none", headingProps?.className)}>
            {title}
          </Heading>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {actions && (
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-control-gap wrap-anywhere">{actions}</div>
        )}
      </div>
    </header>
  );
}
export { PageHeader };
export type { PageHeaderProps };
