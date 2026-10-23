import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from "./Meter.js";
import { Button } from "./Button.js";
type BarListItem = {
  id: string;
  label: string;
  value: number;
};
type BarListProps = IDensityProps & {
  label: string;
  items: readonly BarListItem[];
  onItemSelect?: (item: BarListItem) => void;
  valueFormatter?: (value: number) => string;
};
function BarList({
  label,
  items,
  onItemSelect,
  valueFormatter = (value) => value.toLocaleString(),
  density,
}: BarListProps): ReactElement {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section aria-label={label} data-density={density}>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Meter min={0} max={max} value={item.value} aria-label={item.label} format={{ maximumFractionDigits: 2 }}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <MeterLabel>
                  {onItemSelect ? (
                    <Button type="button" variant="link" className="h-auto p-0" onClick={() => onItemSelect(item)}>
                      {item.label}
                    </Button>
                  ) : (
                    item.label
                  )}
                </MeterLabel>
                <MeterValue>{() => valueFormatter(item.value)}</MeterValue>
              </div>
              <MeterTrack>
                <MeterIndicator />
              </MeterTrack>
            </Meter>
          </li>
        ))}
      </ul>
      {!items.length && (
        <p role="status" className="text-sm text-muted-foreground">
          No data available.
        </p>
      )}
    </section>
  );
}
export { BarList };
export type { BarListProps, BarListItem };
