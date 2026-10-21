import type { JSX, ComponentProps } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../Card.js";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../chart/Chart.js";
import type { ChartConfig } from "../../chart/types.js";
import { cn } from "../../../utils/cn.js";
import { take } from "../utils/range.js";

export type ChartVariant = "area" | "line" | "bars";
const CONFIG: ChartConfig = { amount: { label: "Value", color: "var(--primary)" } };

export function Chart({
  label,
  value,
  delta,
  points,
  visibleCount,
  variant = "area",
  trend,
  upIsGood = true,
  ...props
}: IChartProps): JSX.Element {
  const data = take(points, visibleCount).map((amount, index) => ({ index, amount }));
  const direction =
    trend ??
    (delta === undefined
      ? undefined
      : /\d/.test(delta) && !/[1-9]/.test(delta)
        ? "flat"
        : /^\s*[-−–]/.test(delta)
          ? "down"
          : "up");
  const isGood = direction === "up" || direction === "down" ? (direction === "up") === upIsGood : undefined;
  const axes = (
    <>
      <XAxis dataKey="index" hide domain={[0, Math.max(1, points.length - 1)]} type="number" />
      <YAxis hide domain={[Math.min(0, ...points), Math.max(1, ...points)]} />
    </>
  );
  const tooltip = <ChartTooltip content={<ChartTooltipContent hideLabel />} isAnimationActive={false} />;
  return (
    <Card data-testid="Chart" className="w-full max-w-sm" {...props}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
        {delta !== undefined && (
          <span
            data-trend={direction}
            className={cn(
              "text-sm tabular-nums",
              isGood === undefined ? "text-muted-foreground" : isGood ? "text-success" : "text-destructive",
            )}
          >
            {delta}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={CONFIG} className="h-24 w-full" initialDimension={{ width: 300, height: 96 }}>
          {variant === "bars" ? (
            <BarChart accessibilityLayer aria-label={`${label}: ${value}`} data={data}>
              {axes}
              {tooltip}
              <Bar dataKey="amount" fill="var(--color-amount)" isAnimationActive={false} />
            </BarChart>
          ) : variant === "line" ? (
            <LineChart accessibilityLayer aria-label={`${label}: ${value}`} data={data}>
              {axes}
              {tooltip}
              <Line dataKey="amount" stroke="var(--color-amount)" dot={false} isAnimationActive={false} />
            </LineChart>
          ) : (
            <AreaChart accessibilityLayer aria-label={`${label}: ${value}`} data={data}>
              {axes}
              {tooltip}
              <Area
                dataKey="amount"
                stroke="var(--color-amount)"
                fill="var(--color-amount)"
                fillOpacity={0.15}
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface IChartProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  label: string;
  value: string;
  delta?: string;
  points: readonly number[];
  visibleCount: number;
  variant?: ChartVariant;
  trend?: "up" | "down" | "flat";
  upIsGood?: boolean;
}
