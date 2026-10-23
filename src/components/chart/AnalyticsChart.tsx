import { Area, Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Chart, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "./Chart.js";
type AnalyticsSeries = {
  key: string;
  label: string;
  type?: "line" | "area" | "bar";
  stackId?: string;
};
type AnalyticsChartProps = IDensityProps & {
  label: string;
  data: Record<string, string | number>[];
  index: string;
  series: readonly AnalyticsSeries[];
  valueFormatter?: (value: number) => string;
};
function AnalyticsChart({ label, data, index, series, valueFormatter, density }: AnalyticsChartProps): ReactElement {
  const config = Object.fromEntries(
    series.map((item, i) => [item.key, { label: item.label, color: `var(--chart-${(i % 5) + 1})` }]),
  );
  return (
    <Chart aria-label={label} density={density} config={config} className="h-72 w-full aspect-auto">
      <ComposedChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={valueFormatter} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item) =>
          item.type === "bar" ? (
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={config[item.key]?.color}
              stackId={item.stackId}
              isAnimationActive={false}
            />
          ) : item.type === "area" ? (
            <Area
              key={item.key}
              dataKey={item.key}
              stroke={config[item.key]?.color}
              fill={config[item.key]?.color}
              fillOpacity={0.15}
              stackId={item.stackId}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={item.key}
              dataKey={item.key}
              stroke={config[item.key]?.color}
              dot={false}
              isAnimationActive={false}
            />
          ),
        )}
      </ComposedChart>
    </Chart>
  );
}
type SparklineProps = IDensityProps & {
  label: string;
  values: readonly number[];
  type?: "line" | "area" | "bar";
};
function Sparkline({ label, values, type = "line", density }: SparklineProps): ReactElement {
  const data = values.map((value) => ({ value }));
  const config = { value: { label, color: "var(--chart-1)" } };
  return (
    <Chart
      role="img"
      aria-label={`${label}: ${values.join(", ")}`}
      density={density}
      config={config}
      className="h-12 w-32 aspect-auto"
    >
      <ComposedChart data={data} accessibilityLayer={false}>
        {type === "bar" ? (
          <Bar dataKey="value" fill="var(--chart-1)" isAnimationActive={false} />
        ) : type === "area" ? (
          <Area
            dataKey="value"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.15}
            isAnimationActive={false}
          />
        ) : (
          <Line dataKey="value" stroke="var(--chart-1)" dot={false} isAnimationActive={false} />
        )}
      </ComposedChart>
    </Chart>
  );
}
export { AnalyticsChart, Sparkline };
export type { AnalyticsChartProps, AnalyticsSeries, SparklineProps };
