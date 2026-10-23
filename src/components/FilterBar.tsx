import type { ILabelValue } from "../options/types.js";
import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Input } from "./Input.js";
import { NativeSelect, NativeSelectOption } from "./NativeSelect.js";
import { Button } from "./Button.js";
type FilterDefinition = {
  id: string;
  label: string;
  options: readonly ILabelValue[];
};
type FilterBarProps = IDensityProps & {
  label: string;
  search: string;
  onSearchChange: (value: string) => void;
  filters: readonly FilterDefinition[];
  value: Record<string, string>;
  onValueChange: (value: Record<string, string>) => void;
  disabled?: boolean;
};
function FilterBar({
  label,
  search,
  onSearchChange,
  filters,
  value,
  onValueChange,
  disabled,
  density,
}: FilterBarProps): ReactElement {
  return (
    <fieldset
      aria-label={label}
      disabled={disabled}
      data-density={density}
      className="flex min-w-0 flex-wrap items-center gap-2"
    >
      <Input
        aria-label={`Search ${label}`}
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="min-w-40 flex-1"
      />
      {filters.map((filter) => (
        <NativeSelect
          key={filter.id}
          aria-label={filter.label}
          value={value[filter.id] ?? ""}
          onChange={(event) => onValueChange({ ...value, [filter.id]: event.target.value })}
        >
          <NativeSelectOption value="">All {filter.label.toLowerCase()}</NativeSelectOption>
          {filter.options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ))}
      <Button
        type="button"
        variant="ghost"
        disabled={!search && !Object.values(value).some(Boolean)}
        onClick={() => {
          onSearchChange("");
          onValueChange({});
        }}
      >
        Clear filters
      </Button>
    </fieldset>
  );
}
export { FilterBar };
export type { FilterBarProps, FilterDefinition };
