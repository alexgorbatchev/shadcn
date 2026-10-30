import { useId, useState, type ReactElement } from "react";
import { TZDate } from "@date-fns/tz";
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import type { IDensityProps } from "../../density/types.js";
import { DragDropProvider } from "../DragDropProvider.js";
import { DragSource } from "../DragSource.js";
import { DropTarget } from "../DropTarget.js";
import { Button } from "../Button.js";
import { OptionSelect } from "../OptionSelect.js";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../Table.js";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
type GanttTask = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress?: number;
};
type GanttProps<T extends GanttTask> = IDensityProps & {
  label: string;
  tasks: readonly T[];
  startDate: Date;
  days?: number;
  timeZone?: string;
  onTaskSelect: (task: T) => void;
  onTaskChange?: (task: T) => void;
};
/** Civil-day timeline. End dates are inclusive; shifting preserves wall-clock times across DST. */
function Gantt<T extends GanttTask>({
  label,
  tasks,
  startDate,
  days = 30,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onTaskSelect,
  onTaskChange,
  density,
}: GanttProps<T>): ReactElement {
  const id = useId();
  const type = `application/x-gantt-${id.replaceAll(":", "").toLowerCase()}`;
  const [zoom, setZoom] = useState("day");
  const width = zoom === "day" ? 48 : zoom === "week" ? 24 : 12;
  const start = startOfDay(new TZDate(startDate, timeZone));
  const dates = Array.from({ length: days }, (_, index) => addDays(start, index));
  const shift = (task: T, delta: number): void => {
    onTaskChange?.({
      ...task,
      start: new Date(addDays(new TZDate(task.start, timeZone), delta).getTime()),
      end: new Date(addDays(new TZDate(task.end, timeZone), delta).getTime()),
    });
  };
  return (
    <DragDropProvider>
      <section aria-label={label} data-density={density} data-scroll="none" className="grid min-w-0 gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{label}</h2>
          <OptionSelect
            aria-label="Timeline zoom"
            value={zoom}
            onValueChange={setZoom}
            options={[
              { value: "day", label: "Day scale" },
              { value: "week", label: "Week scale" },
              { value: "month", label: "Month scale" },
            ]}
          />
        </div>
        <div
          role="region"
          aria-label={`${label} timeline`}
          tabIndex={0}
          className="max-h-[65vh] overflow-auto rounded-sm border border-border"
        >
          <Table aria-label={label}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="sticky start-0 z-20 min-w-56 bg-card">
                  Task
                </TableHead>
                {dates.map((date) => (
                  <TableHead
                    key={date.toISOString()}
                    scope="col"
                    className="px-0 text-center text-xs"
                    style={{ minWidth: width, width }}
                  >
                    <abbr title={format(date, "PPP")}>{format(date, zoom === "day" ? "EEE d" : "d")}</abbr>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const offset = differenceInCalendarDays(new TZDate(task.start, timeZone), start);
                const duration =
                  differenceInCalendarDays(new TZDate(task.end, timeZone), new TZDate(task.start, timeZone)) + 1;
                const left = Math.max(0, offset);
                const right = Math.min(days, offset + duration);
                return (
                  <TableRow key={task.id}>
                    <TableHead scope="row" className="sticky start-0 z-10 bg-card">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="link"
                          className="min-w-0 flex-1 justify-start px-0"
                          onClick={() => onTaskSelect(task)}
                        >
                          {task.title}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Move ${task.title} one day earlier`}
                          disabled={!onTaskChange}
                          onClick={() => shift(task, -1)}
                        >
                          <ArrowLeftIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Move ${task.title} one day later`}
                          disabled={!onTaskChange}
                          onClick={() => shift(task, 1)}
                        >
                          <ArrowRightIcon />
                        </Button>
                      </div>
                    </TableHead>
                    <TableCell colSpan={days} className="p-0">
                      <div className="relative h-14" style={{ width: days * width }}>
                        <div
                          className="absolute inset-0 grid"
                          style={{ gridTemplateColumns: `repeat(${days},${width}px)` }}
                        >
                          {dates.map((date) => (
                            <DropTarget
                              key={date.toISOString()}
                              data-date={format(date, "yyyy-MM-dd")}
                              accept={[type]}
                              canDrop={(item) =>
                                Boolean(onTaskChange) &&
                                typeof item.data === "string" &&
                                tasks.some((candidate) => candidate.id === item.data)
                              }
                              onDrop={(item) => {
                                const source = tasks.find((candidate) => candidate.id === item.data);
                                if (source)
                                  shift(source, differenceInCalendarDays(date, new TZDate(source.start, timeZone)));
                              }}
                              className="border-s border-border data-over:bg-accent"
                            />
                          ))}
                        </div>
                        {right > left && (
                          <DragSource
                            type={type}
                            data={task.id}
                            labels={[task.title]}
                            disabled={!onTaskChange}
                            render={<Button type="button" variant="secondary" onClick={() => onTaskSelect(task)} />}
                            aria-label={`${task.title}: ${format(new TZDate(task.start, timeZone), "PPP")} to ${format(new TZDate(task.end, timeZone), "PPP")}${task.progress === undefined ? "" : `, ${task.progress}% complete`}`}
                            className="absolute top-2 overflow-hidden border border-border px-2 text-xs data-dragging:opacity-50"
                            style={{ insetInlineStart: left * width + 2, width: (right - left) * width - 4 }}
                          >
                            {task.progress !== undefined && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-0 start-0 bg-primary/15"
                                style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }}
                              />
                            )}
                            <span className="relative truncate">{task.title}</span>
                          </DragSource>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!tasks.length && (
                <TableRow>
                  <TableCell colSpan={days + 1}>No tasks scheduled.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </DragDropProvider>
  );
}
export { Gantt };
export type { GanttProps, GanttTask };
