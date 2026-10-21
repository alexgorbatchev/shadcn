import type { JSX } from "react";
import {
  Root,
  Grid,
  Cell,
  DayLabels,
  MonthLabels,
  Legend,
  LegendLevel,
  Tooltip,
  DAY_SHORT,
  MONTH_SHORT,
  type DataPoint,
} from "heat-graph";
import { HEAT_GRAPH_COLOR_SCALE } from "./constants.js";
import { useDensity } from "../../../hooks/useDensity.js";
import type { IDensityProps } from "../../../density/types.js";
interface IHeatGraphProps extends IDensityProps {
  data: readonly DataPoint[];
  start?: string | Date;
  end?: string | Date;
  showMonths?: boolean;
}
export function HeatGraph({ data, start, end, density, showMonths = true }: IHeatGraphProps): JSX.Element {
  const resolvedDensity = useDensity(density);
  return (
    <Root
      data-testid="HeatGraph"
      data-slot="assistant-heat-root"
      data-density={resolvedDensity}
      role="group"
      aria-label="Contributions"
      data={[...data]}
      start={start}
      end={end}
      weekStart="monday"
      colorScale={HEAT_GRAPH_COLOR_SCALE}
    >
      <div data-slot="assistant-heat-scroll">
        <div data-slot="assistant-heat-body">
          {showMonths ? (
            <div data-slot="assistant-heat-months">
              <MonthLabels>
                {({ label, totalWeeks }) =>
                  label.column > 0 && totalWeeks - label.column > 1 ? (
                    <span
                      data-slot="assistant-heat-month"
                      style={{ left: String((label.column / totalWeeks) * 100) + "%" }}
                    >
                      {MONTH_SHORT[label.month]}
                    </span>
                  ) : null
                }
              </MonthLabels>
            </div>
          ) : null}
          <div data-slot="assistant-heat-row">
            <div data-slot="assistant-heat-days">
              <DayLabels>
                {({ label }) => (
                  <span data-slot="assistant-heat-day">{label.row % 2 === 0 ? DAY_SHORT[label.dayOfWeek] : ""}</span>
                )}
              </DayLabels>
            </div>
            <Grid data-slot="assistant-heat-grid">
              {({ cell }) => (
                <Cell
                  data-slot="assistant-heat-cell"
                  aria-label={
                    String(cell.count) +
                    " contributions on " +
                    cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  }
                />
              )}
            </Grid>
          </div>
        </div>
      </div>
      <div data-slot="assistant-heat-legend">
        <span>Less</span>
        <Legend>{() => <LegendLevel data-slot="assistant-heat-legend-level" />}</Legend>
        <span>More</span>
      </div>
      <Tooltip role="tooltip" data-slot="assistant-heat-tooltip">
        {({ cell }) => (
          <>
            <strong>{cell.count} contributions</strong> on{" "}
            {cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </>
        )}
      </Tooltip>
    </Root>
  );
}
