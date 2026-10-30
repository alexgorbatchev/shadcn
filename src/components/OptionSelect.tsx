import type { ReactElement, ReactNode } from "react";
import type { IAnalyticsProps } from "../analytics/types.js";
import type { IDensityProps } from "../density/types.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./Select.js";
import { cn } from "../utils/cn.js";

type OptionSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type OptionSelectProps = IDensityProps &
  IAnalyticsProps & {
    options: readonly OptionSelectOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Shown while nothing is selected. */
    placeholder?: ReactNode;
    /** Submits the selected value with the surrounding form under this name. */
    name?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    size?: "sm" | "default";
    /** `full` fills a form field; `fit` sits inline in a toolbar. */
    width?: "fit" | "full";
    "aria-label"?: string;
  };

/** A styled single-value `Select` for the common case of a flat list of options. */
function OptionSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  name,
  id,
  disabled,
  required,
  size = "default",
  width = "fit",
  density,
  analytics,
  "aria-label": ariaLabel,
}: OptionSelectProps): ReactElement {
  return (
    <Select<string>
      items={options}
      analytics={analytics}
      name={name}
      disabled={disabled}
      required={required}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next);
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        density={density}
        size={size}
        className={cn(width === "full" && "w-full")}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent density={density}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { OptionSelect };
export type { OptionSelectOption, OptionSelectProps };
