import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
type PageHeaderProps = IDensityProps & {
  title: string;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};
function PageHeader({ title, description, breadcrumbs, actions, density }: PageHeaderProps): ReactElement {
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
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-control-gap">{actions}</div>}
      </div>
    </header>
  );
}
export { PageHeader };
export type { PageHeaderProps };
