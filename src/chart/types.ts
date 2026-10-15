import type { ComponentProps, ComponentType, CSSProperties, ReactNode } from "react";
import type {
  DefaultLegendContentProps,
  DefaultTooltipContentProps,
  ResponsiveContainer,
  TooltipValueType,
} from "recharts";
import type { Density, IDensityProps } from "../density/types";
import type { ResolvedTheme } from "../theme/types";

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<ResolvedTheme, string> })
>;
export interface IChartContextValue {
  config: ChartConfig;
  density: Density;
  dir: string;
  chartId: string;
}
export type ChartProps = ComponentProps<"div"> &
  IDensityProps & {
    config: ChartConfig;
    children: ComponentProps<typeof ResponsiveContainer>["children"];
    initialDimension?: ComponentProps<typeof ResponsiveContainer>["initialDimension"];
  };
export type ChartStyleProps = { id: string; config: ChartConfig };
export type ChartIndicatorStyle = CSSProperties & { "--color-bg"?: string; "--color-border"?: string };
export type ChartTooltipContentProps = Omit<
  DefaultTooltipContentProps<TooltipValueType, number | string>,
  "accessibilityLayer"
> &
  IDensityProps & {
    className?: string;
    htmlProps?: ComponentProps<"div">;
    active?: boolean;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    color?: string;
  };
export type ChartLegendContentProps = DefaultLegendContentProps &
  IDensityProps & {
    className?: string;
    htmlProps?: ComponentProps<"div">;
    hideIcon?: boolean;
    nameKey?: string;
  };
