import { useState, type ComponentProps, type ReactElement } from "react";
import type { DateRange } from "@daypicker/react";
import type { IDensityProps } from "../../density/types.js";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./Calendar.js";
import { Button } from "../Button.js";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../Popover.js";

type PickerCalendarProps = Omit<
  ComponentProps<typeof Calendar>,
  "mode" | "selected" | "onSelect" | "required" | "locale"
>;
type DatePickerProps = IDensityProps & {
  label: string;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
  locale?: ComponentProps<typeof Calendar>["locale"];
  calendarProps?: PickerCalendarProps;
};
type DateRangePickerProps = Omit<DatePickerProps, "value" | "defaultValue" | "onValueChange" | "name"> & {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
  startName?: string;
  endName?: string;
};
function dateInputValue(date: Date | undefined): string {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
}
function DatePicker(props: DatePickerProps): ReactElement {
  const {
    label,
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    placeholder = "Choose date",
    locale,
    density,
    calendarProps,
  } = props;
  const [draft, setDraft] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = Object.hasOwn(props, "value") ? value : draft;
  const format = new Intl.DateTimeFormat(locale?.code ?? "en-US", { dateStyle: "medium" });
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" density={density} disabled={disabled} />} aria-label={label}>
          <CalendarIcon data-icon="inline-start" />
          {selected ? format.format(selected) : placeholder}
        </PopoverTrigger>
        <PopoverContent density={density} align="start">
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <Calendar
            {...calendarProps}
            density={density}
            locale={locale}
            defaultMonth={selected ?? calendarProps?.defaultMonth}
            mode="single"
            selected={selected}
            onSelect={(next) => {
              if (!Object.hasOwn(props, "value")) setDraft(next);
              onValueChange?.(next);
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {name && <input type="hidden" disabled={disabled} name={name} value={dateInputValue(selected)} />}
    </>
  );
}
function DateRangePicker(props: DateRangePickerProps): ReactElement {
  const {
    label,
    value,
    defaultValue,
    onValueChange,
    disabled,
    startName,
    endName,
    placeholder = "Choose dates",
    locale,
    density,
    calendarProps,
  } = props;
  const [draft, setDraft] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = Object.hasOwn(props, "value") ? value : draft;
  const format = new Intl.DateTimeFormat(locale?.code ?? "en-US", { dateStyle: "medium" });
  const text = selected?.from
    ? selected.to
      ? format.formatRange(selected.from, selected.to)
      : format.format(selected.from)
    : placeholder;
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" density={density} disabled={disabled} />} aria-label={label}>
          <CalendarIcon data-icon="inline-start" />
          {text}
        </PopoverTrigger>
        <PopoverContent density={density} align="start">
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <Calendar
            {...calendarProps}
            density={density}
            locale={locale}
            defaultMonth={selected?.from ?? calendarProps?.defaultMonth}
            mode="range"
            selected={selected}
            onSelect={(next) => {
              if (!Object.hasOwn(props, "value")) setDraft(next);
              onValueChange?.(next);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {startName && <input type="hidden" disabled={disabled} name={startName} value={dateInputValue(selected?.from)} />}
      {endName && <input type="hidden" disabled={disabled} name={endName} value={dateInputValue(selected?.to)} />}
    </>
  );
}
export { DatePicker, DateRangePicker };
export type { DatePickerProps, DateRangePickerProps };
