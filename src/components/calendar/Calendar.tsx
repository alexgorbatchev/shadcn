import type { ComponentProps, ReactElement } from "react";
import type { CalendarProps } from "./types.js";
import { getCalendarClassNames } from "./getCalendarClassNames.js";
import { DayButton, DayPicker } from "@daypicker/react";
import { cn } from "../../utils/cn.js";
import { buttonVariants } from "../Button.js";

function Calendar({
  density,
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: CalendarProps): ReactElement {
  return (
    <DayPicker
      data-density={density}
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      locale={locale}
      className={cn("group/calendar bg-background p-panel [--cell-size:var(--ag-control-h)]", className)}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={getCalendarClassNames({ buttonVariant, classNames })}
      components={{
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: ComponentProps<typeof DayButton>): ReactElement {
  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative size-(--cell-size) border-0 p-0 font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
