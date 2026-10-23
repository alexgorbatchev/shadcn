import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { PageHeader } from "./PageHeader.js";
import { StatCard, type StatCardProps } from "./StatCard.js";
type DashboardStat = Omit<StatCardProps, "density"> & {
  id: string;
};
type DashboardLayoutProps = IDensityProps & {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  stats: readonly DashboardStat[];
  children: ReactNode;
  footer?: ReactNode;
};
function DashboardLayout({
  title,
  description,
  actions,
  filters,
  stats,
  children,
  footer,
  density,
}: DashboardLayoutProps): ReactElement {
  return (
    <div data-density={density} data-scroll="none" className="grid min-w-0 gap-6">
      <PageHeader title={title} description={description} actions={actions} />
      {filters}
      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ id, ...stat }) => (
            <StatCard key={id} {...stat} />
          ))}
        </div>
      )}
      <div className="grid min-w-0 gap-4">{children}</div>
      {footer}
    </div>
  );
}
export { DashboardLayout };
export type { DashboardLayoutProps, DashboardStat };
