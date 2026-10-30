import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
type PageHeaderProps = IDensityProps & {
  title: string;
  /** Context above the page title without introducing another heading. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};
function PageHeader({ title, eyebrow, description, breadcrumbs, actions, density }: PageHeaderProps): ReactElement {
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
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
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
