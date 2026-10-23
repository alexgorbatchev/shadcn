import {
  Calendar as NativeCalendar,
  dateFnsLocalizer,
  type CalendarProps,
  type ToolbarProps,
  type EventWrapperProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { createElement, isValidElement, type ComponentProps, type PropsWithChildren, type ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { cn } from "../../utils/cn.js";

const eventCalendarLocalizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { "en-US": enUS } });
function EventCalendarToolbar<T extends object, R extends object>({
  label,
  view,
  views,
  onNavigate,
  onView,
  localizer,
}: ToolbarProps<T, R>): ReactElement {
  const names = Array.isArray(views) ? views : Object.keys(views ?? {});
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-1">
        <Button type="button" variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          {localizer.messages.previous}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          {localizer.messages.today}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          {localizer.messages.next}
        </Button>
      </div>
      <h2 aria-live="polite" className="text-sm font-semibold">
        {label}
      </h2>
      <div className="flex flex-wrap gap-1" aria-label="Calendar views" role="group">
        {names.map((name) => {
          if (name !== "month" && name !== "week" && name !== "work_week" && name !== "day" && name !== "agenda")
            return null;
          return (
            <Button
              key={name}
              type="button"
              size="sm"
              variant={view === name ? "default" : "outline"}
              aria-pressed={view === name}
              onClick={() => onView(name)}
            >
              {localizer.messages[name] ?? name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
/** RBC's eventWrapper extension replaces its clickable div with a native button. */
function EventButton<T extends object>({ children }: PropsWithChildren<EventWrapperProps<T>>): ReactElement {
  if (!isValidElement<ComponentProps<"button">>(children))
    throw new Error("An event wrapper requires one event element.");
  return createElement("button", { ...children.props, type: "button" }, children.props.children);
}
type EventCalendarProps<T extends object, R extends object = object> = Omit<
  CalendarProps<T, R>,
  "className" | "style" | "popup" | "popupOffset" | "localizer"
> &
  IDensityProps & { label: string; height?: number | string; localizer?: CalendarProps<T, R>["localizer"] };
/** Import @alexgorbatchev/shadcn/event-calendar.css. Native localizer and event APIs are preserved. */
function EventCalendar<T extends object, R extends object = object>({
  label,
  height = 640,
  density,
  components,
  localizer = eventCalendarLocalizer,
  ...props
}: EventCalendarProps<T, R>): ReactElement {
  return (
    <section
      aria-label={label}
      data-density={density}
      data-scroll="none"
      className="min-w-0 rounded-sm border border-border bg-card p-3"
    >
      <NativeCalendar<T, R>
        {...props}
        localizer={localizer}
        popup={false}
        className={cn("ag-event-calendar")}
        style={{ height }}
        components={{ toolbar: EventCalendarToolbar, eventWrapper: EventButton, ...components }}
      />
    </section>
  );
}
export { EventCalendar, EventCalendarToolbar, eventCalendarLocalizer };
export type { EventCalendarProps };
export { dateFnsLocalizer } from "react-big-calendar";
export type { Event, View, SlotInfo, DateLocalizer, CalendarProps, ToolbarProps } from "react-big-calendar";
