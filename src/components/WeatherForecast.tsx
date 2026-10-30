import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";
import { WeatherSummary, type IWeatherDay, type TemperatureUnit } from "./WeatherSummary.js";

type WeatherForecastDay = IWeatherDay & { id: string };
type WeatherForecastProps = Omit<ComponentProps<"ul">, "children"> &
  IDensityProps & {
    days: readonly WeatherForecastDay[];
    /** Accessible name of the forecast list. */
    label: string;
    unit?: TemperatureUnit;
    locale?: string;
    /** `strip` shows compact days side by side and wraps them; `list` shows one detailed day per row. */
    variant?: "strip" | "list";
  };

/** Several days of weather as a labelled list. */
function WeatherForecast({
  days,
  label,
  unit,
  locale,
  variant = "strip",
  density,
  className,
  ...props
}: WeatherForecastProps): ReactElement {
  return (
    <ul
      aria-label={label}
      data-slot="weather-forecast"
      data-density={density}
      className={cn(
        "grid min-w-0 gap-panel-sm",
        variant === "strip" && "grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]",
        className,
      )}
      {...props}
    >
      {days.map(({ id, ...day }) => (
        <WeatherSummary
          key={id}
          {...day}
          unit={unit}
          locale={locale}
          variant={variant === "strip" ? "compact" : "default"}
          render={<li />}
        />
      ))}
    </ul>
  );
}

export { WeatherForecast };
export type { WeatherForecastDay, WeatherForecastProps };
