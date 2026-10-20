import { getDefaultClassNames } from "@daypicker/react";
import type { CalendarProps } from "./types.js";
import { cn } from "../../utils/cn.js";
import { buttonVariants } from "../Button.js";

function getCalendarClassNames({
  buttonVariant = "ghost",
  classNames,
}: CalendarProps): NonNullable<CalendarProps["classNames"]> {
  const defaultClassNames = getDefaultClassNames();
  return {
    root: cn("w-fit", defaultClassNames.root),
    months: cn("relative flex flex-col gap-panel md:flex-row", defaultClassNames.months),
    month: cn("flex flex-col gap-control-gap", defaultClassNames.month),
    nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", defaultClassNames.nav),
    button_previous: cn(
      buttonVariants({ variant: buttonVariant, size: "icon" }),
      "size-(--cell-size) p-0 rtl:[&>svg]:rotate-180",
      defaultClassNames.button_previous,
    ),
    button_next: cn(
      buttonVariants({ variant: buttonVariant, size: "icon" }),
      "size-(--cell-size) p-0 rtl:[&>svg]:rotate-180",
      defaultClassNames.button_next,
    ),
    chevron: cn("size-4 fill-current text-muted-foreground", defaultClassNames.chevron),
    month_caption: cn(
      "flex h-(--cell-size) items-center justify-center px-(--cell-size)",
      defaultClassNames.month_caption,
    ),
    dropdowns: cn(
      "flex h-(--cell-size) items-center justify-center gap-control-gap text-sm font-medium",
      defaultClassNames.dropdowns,
    ),
    dropdown_root: cn("relative focus-within:ring-1 focus-within:ring-ring", defaultClassNames.dropdown_root),
    dropdown: cn("absolute inset-0 w-full cursor-pointer bg-popover opacity-0", defaultClassNames.dropdown),
    caption_label: cn("flex items-center gap-1 text-sm font-medium select-none", defaultClassNames.caption_label),
    month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
    weekdays: cn("flex", defaultClassNames.weekdays),
    weekday: cn("w-(--cell-size) text-xs font-normal text-muted-foreground", defaultClassNames.weekday),
    week: cn("mt-1 flex w-full", defaultClassNames.week),
    week_number_header: cn("w-(--cell-size)", defaultClassNames.week_number_header),
    week_number: cn(
      "flex w-(--cell-size) items-center justify-center text-xs text-muted-foreground",
      defaultClassNames.week_number,
    ),
    day: cn("group/day relative size-(--cell-size) p-0 text-center", defaultClassNames.day),
    range_start: cn("bg-muted", defaultClassNames.range_start),
    range_middle: cn("bg-muted", defaultClassNames.range_middle),
    range_end: cn("bg-muted", defaultClassNames.range_end),
    today: cn("bg-muted text-foreground", defaultClassNames.today),
    outside: cn("text-muted-foreground", defaultClassNames.outside),
    disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
    hidden: cn("invisible", defaultClassNames.hidden),
    ...classNames,
  };
}

export { getCalendarClassNames };
