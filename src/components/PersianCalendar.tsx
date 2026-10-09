import type { ComponentProps, ReactElement } from "react";
import type { CalendarProps } from "../calendar/types";
import { DayPicker } from "@daypicker/persian";
import { getCalendarClassNames } from "../calendar/getCalendarClassNames";
import { cn } from "../utils/cn";
import { CalendarDayButton } from "./Calendar";

type PersianCalendarProps = ComponentProps<typeof DayPicker> & Pick<CalendarProps, "density" | "buttonVariant">;

function PersianCalendar({
  density,
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  components,
  ...props
}: PersianCalendarProps): ReactElement {
  return (
    <DayPicker
      data-density={density}
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("group/calendar bg-background p-panel [--cell-size:var(--ag-control-h)]", className)}
      classNames={getCalendarClassNames({ buttonVariant, classNames })}
      components={{ DayButton: CalendarDayButton, ...components }}
      {...props}
    />
  );
}

export { PersianCalendar };
