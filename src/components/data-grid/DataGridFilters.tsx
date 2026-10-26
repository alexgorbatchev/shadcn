import { Subscribe, type RowData } from "@tanstack/react-table";
import { ListFilterIcon } from "lucide-react";
import { useId, type ReactElement } from "react";
import type { ILabelValue } from "../../options/types.js";
import { useComboboxAnchor } from "../../hooks/useComboboxAnchor.js";
import { Badge } from "../Badge.js";
import { Button } from "../Button.js";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "../Combobox.js";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "../NumberField.js";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "../Popover.js";
import { ScrollArea } from "../ScrollArea.js";
import type {
  DataGridColumn,
  IDataGridFilterControlProps,
  IDataGridOptionsFilter,
  IDataGridRangeFilter,
} from "./DataGrid.js";
import { getDataGridFilterLabel } from "./getDataGridFilterLabel.js";
import { getDataGridFilterOptions } from "./getDataGridFilterOptions.js";
import { readDataGridOptionValues } from "./readDataGridOptionValues.js";
import { readDataGridRange, type DataGridRange } from "./readDataGridRange.js";

interface IDataGridRangeFilterControlProps<T extends RowData> {
  column: DataGridColumn<T>;
  filter: IDataGridRangeFilter;
  label: string;
}

function DataGridRangeFilterControl<T extends RowData>({
  column,
  filter,
  label,
}: IDataGridRangeFilterControlProps<T>): ReactElement {
  const labelId = useId();
  const [min, max] = readDataGridRange(column.getFilterValue());
  const available = column.getFacetedMinMaxValues();
  const formatter = new Intl.NumberFormat(undefined, filter.format);
  const update = (next: DataGridRange): void =>
    column.setFilterValue(next[0] === null && next[1] === null ? undefined : next);
  return (
    <div role="group" aria-labelledby={labelId} className="grid gap-1.5">
      <span id={labelId} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          value={min}
          step={filter.step}
          format={filter.format}
          onValueChange={(value) => update([value, max])}
        >
          <NumberFieldGroup>
            <NumberFieldInput
              aria-label={`Minimum ${label}`}
              placeholder={available ? formatter.format(available[0]) : "Min"}
            />
          </NumberFieldGroup>
        </NumberField>
        <NumberField
          value={max}
          step={filter.step}
          format={filter.format}
          onValueChange={(value) => update([min, value])}
        >
          <NumberFieldGroup>
            <NumberFieldInput
              aria-label={`Maximum ${label}`}
              placeholder={available ? formatter.format(available[1]) : "Max"}
            />
          </NumberFieldGroup>
        </NumberField>
      </div>
    </div>
  );
}

interface IDataGridOptionsFilterControlProps<T extends RowData> {
  column: DataGridColumn<T>;
  filter: IDataGridOptionsFilter;
  options: readonly ILabelValue[];
  label: string;
}

function DataGridOptionsFilterControl<T extends RowData>({
  column,
  filter,
  options,
  label,
}: IDataGridOptionsFilterControlProps<T>): ReactElement {
  const labelId = useId();
  const anchor = useComboboxAnchor();
  const counts = column.getFacetedUniqueValues();
  // A saved value whose option no longer exists stays visible, so it can still be removed.
  const selected = readDataGridOptionValues(column.getFilterValue()).map(
    (value) => options.find((option) => option.value === value) ?? { label: value, value },
  );
  const update = (next: readonly ILabelValue[]): void =>
    column.setFilterValue(next.length ? next.map((option) => option.value) : undefined);
  const content = (
    <>
      <ComboboxEmpty>No matches.</ComboboxEmpty>
      <ComboboxList>
        {(option: ILabelValue) => (
          <ComboboxItem key={option.value} value={option}>
            <span className="min-w-0 flex-1 truncate">{option.label}</span>{" "}
            <span className="text-xs text-muted-foreground tabular-nums">{counts.get(option.value) ?? 0}</span>
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );
  return (
    <div className="grid gap-1.5">
      <span id={labelId} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {filter.multiple === false ? (
        <Combobox
          items={options}
          value={selected[0] ?? null}
          onValueChange={(option: ILabelValue | null) => update(option ? [option] : [])}
          itemToStringLabel={(option: ILabelValue) => option.label}
          isItemEqualToValue={(option: ILabelValue, value: ILabelValue) => option.value === value.value}
        >
          <ComboboxInput aria-labelledby={labelId} placeholder="Any" showClear clearLabel={`Clear ${label}`} />
          <ComboboxContent>{content}</ComboboxContent>
        </Combobox>
      ) : (
        <Combobox
          items={options}
          multiple
          value={selected}
          onValueChange={(chosen: ILabelValue[]) => update(chosen)}
          itemToStringLabel={(option: ILabelValue) => option.label}
          isItemEqualToValue={(option: ILabelValue, value: ILabelValue) => option.value === value.value}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(chosen: ILabelValue[]) => (
                <>
                  {chosen.map((option) => (
                    <ComboboxChip key={option.value} removeLabel={`Remove ${option.label}`}>
                      {option.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput aria-labelledby={labelId} placeholder={chosen.length ? undefined : "Any"} />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>{content}</ComboboxContent>
        </Combobox>
      )}
    </div>
  );
}

/**
 * Edits the filters of every column whose `meta.filter` describes one, hidden columns included. Filters combine with
 * each other and with the global filter; each control suggests only values the other filters leave. The trigger counts
 * the active column filters, and Clear filters removes them all. `label` titles the trigger and popover; `options`
 * supplies options-filter choices that depend on runtime data.
 */
export function DataGridFilters<T extends RowData>({
  table,
  label = "Filters",
  options,
}: IDataGridFilterControlProps<T>): ReactElement {
  return (
    <Popover>
      <Subscribe source={table.atoms.columnFilters}>
        {(filters) => (
          <PopoverTrigger render={<Button variant="outline" />}>
            <ListFilterIcon data-icon="inline-start" aria-hidden="true" />
            {label}
            {filters.length > 0 && (
              <Badge variant="secondary">
                {filters.length}
                <span className="sr-only"> active</span>
              </Badge>
            )}
          </PopoverTrigger>
        )}
      </Subscribe>
      <PopoverContent align="end" className="max-h-(--available-height) w-80">
        <PopoverHeader>
          <PopoverTitle>{label}</PopoverTitle>
        </PopoverHeader>
        <Subscribe source={table.atoms.columnFilters}>
          {(filters) => (
            <>
              <ScrollArea className="flex-1">
                <div className="grid gap-3 pe-2.5">
                  {table.getAllLeafColumns().map((column) => {
                    const filter = column.columnDef.meta?.filter;
                    if (!filter) return null;
                    const name = getDataGridFilterLabel(column);
                    return filter.variant === "range" ? (
                      <DataGridRangeFilterControl key={column.id} column={column} filter={filter} label={name} />
                    ) : (
                      <DataGridOptionsFilterControl
                        key={column.id}
                        column={column}
                        filter={filter}
                        options={getDataGridFilterOptions(column, options)}
                        label={name}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.length === 0}
                onClick={() => table.setColumnFilters([])}
              >
                Clear filters
              </Button>
            </>
          )}
        </Subscribe>
      </PopoverContent>
    </Popover>
  );
}
