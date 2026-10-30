import type { ReactElement, ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  CloudDrizzleIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  DropletIcon,
  SunIcon,
  type LucideIcon,
} from "lucide-react";
import type { Density, IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";

type WeatherCondition = "clear" | "partly-cloudy" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunderstorm";
type TemperatureUnit = "celsius" | "fahrenheit";

const CONDITION_ICONS: Record<WeatherCondition, LucideIcon> = {
  clear: SunIcon,
  "partly-cloudy": CloudSunIcon,
  cloudy: CloudIcon,
  fog: CloudFogIcon,
  drizzle: CloudDrizzleIcon,
  rain: CloudRainIcon,
  snow: CloudSnowIcon,
  thunderstorm: CloudLightningIcon,
};

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: "Clear",
  "partly-cloudy": "Partly cloudy",
  cloudy: "Cloudy",
  fog: "Fog",
  drizzle: "Drizzle",
  rain: "Rain",
  snow: "Snow",
  thunderstorm: "Thunderstorm",
};

interface IWeatherDay {
  /** Day or period name, such as a formatted date. */
  label: ReactNode;
  condition: WeatherCondition;
  /** Localized condition text; defaults to an English name for `condition`. */
  conditionLabel?: string;
  high: number;
  low: number;
  /** Chance of precipitation from 0 to 100. */
  precipitationProbability?: number;
}

type WeatherSummaryState = { slot: "weather-summary"; condition: WeatherCondition; density?: Density };
type WeatherSummaryProps = Omit<useRender.ComponentProps<"div", WeatherSummaryState>, "children"> &
  IDensityProps &
  IWeatherDay & {
    unit?: TemperatureUnit;
    /** BCP 47 locale for temperatures and percentages; defaults to the runtime locale. */
    locale?: string;
    /** `compact` keeps the condition name for assistive technology only. */
    variant?: "default" | "compact";
  };

function formatTemperature(value: number, unit: TemperatureUnit, locale: string | undefined): string {
  return new Intl.NumberFormat(locale, { style: "unit", unit, maximumFractionDigits: 0 }).format(value);
}

function formatProbability(value: number, locale: string | undefined): string {
  const share = Math.min(100, Math.max(0, value)) / 100;
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(share);
}

/** One day's forecast: label, condition icon and name, high and low temperatures, and precipitation chance. */
function WeatherSummary({
  label,
  condition,
  conditionLabel = CONDITION_LABELS[condition],
  high,
  low,
  precipitationProbability,
  unit = "celsius",
  locale,
  variant = "default",
  density,
  className,
  render,
  ...props
}: WeatherSummaryProps): ReactElement {
  const ConditionIcon = CONDITION_ICONS[condition];
  const highText = formatTemperature(high, unit, locale);
  const lowText = formatTemperature(low, unit, locale);
  const probabilityText =
    precipitationProbability === undefined ? undefined : formatProbability(precipitationProbability, locale);
  const isCompact = variant === "compact";
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex min-w-0 text-foreground",
          isCompact ? "flex-col items-center gap-1 text-center" : "items-center gap-panel-sm",
          className,
        ),
        children: (
          <>
            <ConditionIcon
              aria-hidden="true"
              data-slot="weather-summary-icon"
              className={cn("shrink-0 text-muted-foreground", isCompact ? "size-6" : "size-8")}
            />
            <div className={cn("flex min-w-0 flex-col gap-0.5", isCompact && "items-center")}>
              <div className="text-sm font-medium break-words">{label}</div>
              <div className={cn("text-sm text-muted-foreground", isCompact && "sr-only")}>{conditionLabel}</div>
              <div className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums">
                <span>
                  <span className="sr-only">High </span>
                  <span className="font-medium">{highText}</span>
                </span>
                <span className="text-muted-foreground">
                  <span className="sr-only">Low </span>
                  {lowText}
                </span>
              </div>
              {probabilityText !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                  <DropletIcon aria-hidden="true" className="size-3 shrink-0" />
                  <span>
                    {probabilityText}
                    <span className="sr-only"> chance of precipitation</span>
                  </span>
                </div>
              )}
            </div>
          </>
        ),
      },
      props,
    ),
    render,
    state: { slot: "weather-summary", condition, density },
  });
}

export { WeatherSummary };
export type { IWeatherDay, TemperatureUnit, WeatherCondition, WeatherSummaryProps };
