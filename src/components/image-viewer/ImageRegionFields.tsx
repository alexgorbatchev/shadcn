import { useId, type ReactElement } from "react";
import { cn } from "../../utils/cn.js";
import type { IDensityProps } from "../../density/types.js";
import { Field, FieldLabel } from "../Field.js";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "../NumberField.js";
import { clampImageRegion } from "./imageRegion.js";
import type { IImageRect } from "./types.js";

export interface IImageRegionFieldsProps extends IDensityProps {
  region: IImageRect;
  onRegionChange: (region: IImageRect) => void;
  /** Accessible name of the group. Defaults to "Region". */
  label?: string;
  className?: string;
}

type RegionKey = keyof IImageRect;

const FIELDS: readonly [RegionKey, string][] = [
  ["x", "Left"],
  ["y", "Top"],
  ["width", "Width"],
  ["height", "Height"],
];

function toPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

/**
 * A placed region's Left, Top, Width and Height as four percent fields that take typed values, for steps finer than
 * the arrow keys' 5%. Values outside the image are pulled back inside it.
 */
export function ImageRegionFields({
  region,
  onRegionChange,
  label = "Region",
  className,
  density,
}: IImageRegionFieldsProps): ReactElement {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="image-region-fields"
      data-density={density}
      className={cn("flex flex-wrap items-end gap-control-gap", className)}
    >
      {FIELDS.map(([key, name]) => (
        <Field key={key} className="w-20">
          <FieldLabel htmlFor={`${id}-${key}`}>{name}</FieldLabel>
          <NumberField
            id={`${id}-${key}`}
            density={density}
            value={toPercent(region[key])}
            min={0}
            max={100}
            step={1}
            smallStep={0.1}
            format={{ maximumFractionDigits: 1 }}
            onValueChange={(value) => {
              if (value === null) return;
              onRegionChange(clampImageRegion({ ...region, [key]: value / 100 }));
            }}
          >
            <NumberFieldGroup>
              <NumberFieldInput aria-describedby={`${id}-unit`} />
            </NumberFieldGroup>
          </NumberField>
        </Field>
      ))}
      <span id={`${id}-unit`} className="sr-only">
        percent of the image
      </span>
    </div>
  );
}
