import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card.js";
import { Badge } from "./Badge.js";
import { Skeleton } from "./Skeleton.js";
type StatCardProps = IDensityProps & {
  label: string;
  value: ReactNode;
  change?: string;
  changeIntent?: "positive" | "negative" | "neutral";
  description?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
};
function StatCard({
  label,
  value,
  change,
  changeIntent = "neutral",
  description,
  children,
  loading = false,
  density,
}: StatCardProps): ReactElement {
  return (
    <Card density={density} aria-label={label} aria-busy={loading}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-control-gap">
          {loading ? (
            <Skeleton className="h-8 w-24" aria-label={`Loading ${label}`} />
          ) : (
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
          )}
          {change && (
            <Badge
              variant={
                changeIntent === "positive" ? "success" : changeIntent === "negative" ? "destructive" : "secondary"
              }
            >
              {change}
            </Badge>
          )}
        </div>
      </CardContent>
      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}
export { StatCard };
export type { StatCardProps };
