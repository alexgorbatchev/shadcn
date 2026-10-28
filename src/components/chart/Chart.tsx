import { AnalyticsButton } from "../analytics/AnalyticsButton.js";
import type { ReactElement } from "react";
import type { ChartProps, ChartTooltipContentProps, ChartLegendContentProps, ChartIndicatorStyle } from "./types.js";
import { useId, useMemo } from "react";
import { ResponsiveContainer, Tooltip, Legend } from "recharts";
import sortBy from "es-toolkit/compat/sortBy";
import { ChartContext } from "./ChartContext.js";
import { getPayloadConfigFromPayload } from "./getPayloadConfigFromPayload.js";
import { useChart } from "./hooks/useChart.js";
import { useDensity } from "../../hooks/useDensity.js";
import { cn } from "../../utils/cn.js";
import { ChartStyle } from "./ChartStyle.js";
import { useDirection } from "../DirectionProvider.js";

function Chart({
  id,
  dir,
  density,
  className,
  children,
  config,
  initialDimension = { width: 320, height: 200 },
  ...props
}: ChartProps): ReactElement {
  const uniqueId = useId();
  const resolvedDensity = useDensity(density);
  const inheritedDirection = useDirection();
  const direction = dir ?? inheritedDirection;
  const chartId = `chart-${id ?? uniqueId}`;
  return (
    <ChartContext.Provider value={{ config, density: resolvedDensity, dir: direction, chartId }}>
      <div
        id={id}
        dir={direction}
        data-density={resolvedDensity}
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video min-w-0 justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartTooltipContent({
  density,
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  valueFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  htmlProps,
  contentStyle,
  itemStyle,
  labelStyle,
  wrapperClassName,
  itemSorter,
}: ChartTooltipContentProps): ReactElement | null {
  const { config, density: chartDensity, dir, chartId } = useChart();
  const tooltipLabel = useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label;
    if (labelFormatter)
      return (
        <div className={cn("font-medium", labelClassName)} style={labelStyle}>
          {labelFormatter(value, payload)}
        </div>
      );
    if (!value) return null;
    return (
      <div className={cn("font-medium", labelClassName)} style={labelStyle}>
        {value}
      </div>
    );
  }, [label, labelFormatter, payload, hideLabel, labelClassName, labelStyle, config, labelKey]);
  if (!active || !payload?.length) return null;
  const sortedPayload = itemSorter ? sortBy(payload, itemSorter) : payload;
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return (
    <div
      role="status"
      data-slot="chart-tooltip"
      data-chart={chartId}
      dir={dir}
      data-density={density ?? chartDensity}
      {...htmlProps}
      className={cn(
        "grid min-w-32 items-start gap-control-gap rounded-md border border-frame-edge bg-popover p-panel text-xs text-popover-foreground shadow-frame",
        className,
        wrapperClassName,
        htmlProps?.className,
      )}
      style={{ ...contentStyle, ...htmlProps?.style }}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-control-gap">
        {sortedPayload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const itemPayload: unknown = item.payload;
            const fill: unknown =
              typeof itemPayload === "object" && itemPayload !== null && "fill" in itemPayload
                ? itemPayload.fill
                : undefined;
            const indicatorColor = color ?? (typeof fill === "string" ? fill : item.color);
            const indicatorStyle: ChartIndicatorStyle = {
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor,
            };
            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-control-gap [&>svg]:size-3 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
                style={itemStyle}
              >
                {formatter && item.value !== undefined && item.name !== undefined ? (
                  formatter(item.value, item.name, item, index, payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          aria-hidden="true"
                          className={cn("shrink-0 rounded-sm border-(--color-border) bg-(--color-bg)", {
                            "size-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={indicatorStyle}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between gap-control-gap leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-control-gap">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium tabular-nums">
                          {typeof item.value === "number"
                            ? (valueFormatter?.(item.value) ?? item.value.toLocaleString())
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function ChartLegendContent({
  density,
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  onClick,
  onMouseEnter,
  onMouseLeave,
  formatter,
  htmlProps,
  labelStyle,
  inactiveColor,
}: ChartLegendContentProps): ReactElement | null {
  const { config, density: chartDensity, dir, chartId } = useChart();
  if (!payload?.length) return null;
  return (
    <div
      data-slot="chart-legend"
      data-chart={chartId}
      dir={dir}
      data-density={density ?? chartDensity}
      {...htmlProps}
      className={cn(
        "flex items-center justify-center gap-panel",
        verticalAlign === "top" ? "pb-panel" : "pt-panel",
        className,
        htmlProps?.className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const content = (
            <>
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.inactive ? inactiveColor : item.color }}
                />
              )}
              <span style={labelStyle}>
                {formatter
                  ? formatter(itemConfig?.label ?? item.value, item, index)
                  : (itemConfig?.label ?? item.value)}
              </span>
            </>
          );
          const classes = "flex items-center gap-control-gap [&>svg]:size-3 [&>svg]:text-muted-foreground";
          return onClick ? (
            <AnalyticsButton
              component="ChartLegendContent"
              key={index}
              type="button"
              className={cn(classes, "outline-none focus-visible:ring-1 focus-visible:ring-ring")}
              onClick={(event) => onClick(item, index, event)}
              onMouseEnter={(event) => onMouseEnter?.(item, index, event)}
              onMouseLeave={(event) => onMouseLeave?.(item, index, event)}
            >
              {content}
            </AnalyticsButton>
          ) : (
            <div
              key={index}
              className={classes}
              onMouseEnter={(event) => onMouseEnter?.(item, index, event)}
              onMouseLeave={(event) => onMouseLeave?.(item, index, event)}
            >
              {content}
            </div>
          );
        })}
    </div>
  );
}

const ChartTooltip = Tooltip;
const ChartLegend = Legend;
export {
  Chart,
  Chart as ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
