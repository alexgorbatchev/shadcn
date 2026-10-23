import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card.js";
import { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from "./Meter.js";
import { Button } from "./Button.js";
type UsageMetric = {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
};
type BillingUsageProps = IDensityProps & {
  plan: string;
  price: string;
  period: string;
  metrics: readonly UsageMetric[];
  onManage: () => void;
  pending?: boolean;
};
function BillingUsage({ plan, price, period, metrics, onManage, pending, density }: BillingUsageProps): ReactElement {
  return (
    <Card density={density} aria-label="Billing and usage">
      <CardHeader>
        <CardTitle>{plan}</CardTitle>
        <CardDescription>
          {price} · {period}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {metrics.map((metric) => (
          <Meter key={metric.id} value={metric.used} max={metric.limit} aria-label={metric.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <MeterLabel>{metric.label}</MeterLabel>
              <MeterValue>
                {() =>
                  `${metric.used.toLocaleString()} / ${metric.limit.toLocaleString()}${metric.unit ? ` ${metric.unit}` : ""}`
                }
              </MeterValue>
            </div>
            <MeterTrack>
              <MeterIndicator />
            </MeterTrack>
          </Meter>
        ))}
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline" onClick={onManage} disabled={pending}>
          Manage billing
        </Button>
      </CardFooter>
    </Card>
  );
}
export { BillingUsage };
export type { BillingUsageProps, UsageMetric };
