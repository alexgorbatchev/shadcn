import type { ComponentProps, JSX } from "react";
import type { DataPoint } from "heat-graph";
import { HeatGraph } from "./HeatGraph.js";
interface IActivityGraphProps extends Omit<ComponentProps<"div">, "children" | "title" | "className" | "style"> {
  data: readonly DataPoint[];
  start: string | Date;
  end: string | Date;
  title: string;
  total: string;
}
export function ActivityGraph({ data, start, end, title, total, ...props }: IActivityGraphProps): JSX.Element {
  return (
    <div
      {...props}
      data-testid="ActivityGraph"
      data-slot="activity-graph"
      className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-frame-edge bg-card p-2 text-card-foreground shadow-frame"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-medium">{title}</span>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">{total}</span>
      </div>
      <HeatGraph data={data} start={start} end={end} density="compact" showMonths={false} />
    </div>
  );
}
