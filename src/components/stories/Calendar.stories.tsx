import type { ComponentProps, ReactElement } from "react";
import type { DateRange } from "@daypicker/react";
import { TZDate } from "@daypicker/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Calendar, CalendarDayButton } from "../Calendar";
import { DirectionProvider } from "../DirectionProvider";
import { CalendarIcon, Clock2Icon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../InputGroup";
import { Button } from "../Button";
import { Field, FieldGroup, FieldLabel } from "../Field";
import { Input } from "../Input";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../Popover";
import { ToggleGroup, ToggleGroupItem } from "../ToggleGroup";
import { DateInputPickerExample } from "./helpers";
import { cn } from "../../utils/cn";

type CalendarStoryProps = Omit<ComponentProps<typeof Calendar>, "mode" | "required" | "selected" | "onSelect">;
const meta: Meta<CalendarStoryProps> = {
  title: "shadcn-alexgorbatchev/components/Calendar",
  component: Calendar,
  tags: ["autodocs", "test"],
  args: { defaultMonth: new Date(2026, 9), today: new Date(2026, 9, 8) },
  argTypes: { density: { control: "select", options: ["compact", "comfortable"] } },
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8));
    return (
      <div>
        <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
        <output aria-label="Selected day">{date?.getDate()}</output>
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Today, Thursday, October 8th, 2026, selected" }));
    await userEvent.keyboard("{ArrowRight}");
    const nextDay = canvas.getByRole("button", { name: "Friday, October 9th, 2026" });
    await waitFor(() => expect(nextDay).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected day")).toHaveTextContent("9");
    await userEvent.click(canvas.getByRole("button", { name: "Go to the Next Month" }));
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Go to the Previous Month" }));
    await expect(canvas.getByRole("grid", { name: "October 2026" })).toBeVisible();
  },
};
export const Compact: Story = {
  ...Default,
  args: { density: "compact" },
  play: async (context) => {
    await Default.play?.(context);
    const day = within(context.canvasElement).getByRole("button", { name: "Friday, October 9th, 2026, selected" });
    await expect(day.getBoundingClientRect().height).toBe(20);
  },
};
export const Range: Story = {
  render: function Render() {
    const [range, setRange] = useState<DateRange | undefined>();
    return (
      <div>
        <Calendar
          mode="range"
          defaultMonth={new Date(2026, 9)}
          today={new Date(2026, 9, 8)}
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
        <output aria-label="Selected range">
          {range?.from?.getDate()} – {range?.to?.getDate()}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const october = within(canvas.getByRole("grid", { name: "October 2026" }));
    await userEvent.click(october.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.click(october.getByRole("button", { name: "Monday, October 12th, 2026" }));
    await expect(canvas.getByLabelText("Selected range")).toHaveTextContent("9 – 12");
    await expect(
      october.getByRole("button", { name: "Saturday, October 10th, 2026, selected" }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
  },
};
export const Dropdowns: Story = {
  args: {
    captionLayout: "dropdown",
    showWeekNumber: true,
    startMonth: new Date(2020, 0),
    endMonth: new Date(2030, 11),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Choose the Month" }), "10");
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Choose the Year" }), "2027");
    await expect(canvas.getByRole("grid", { name: "November 2027" })).toBeVisible();
  },
};
export const DisabledDays: Story = {
  args: { disabled: { dayOfWeek: [0, 6] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Saturday, October 10th, 2026" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Monday, October 12th, 2026" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected day")).toHaveTextContent("12");
  },
};

export const Multiple: Story = {
  render: function Render() {
    const [dates, setDates] = useState<Date[] | undefined>([]);
    return (
      <div>
        <Calendar
          mode="multiple"
          defaultMonth={new Date(2026, 9)}
          today={new Date(2026, 9, 8)}
          selected={dates}
          onSelect={setDates}
        />
        <output aria-label="Selected dates">{dates?.map((date) => date.getDate()).join(", ")}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.click(canvas.getByRole("button", { name: "Monday, October 12th, 2026" }));
    await expect(canvas.getByLabelText("Selected dates")).toHaveTextContent("9, 12");
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026, selected" }));
    await expect(canvas.getByLabelText("Selected dates")).toHaveTextContent("12");
  },
};

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole("button", { name: "Go to the Previous Month" }).querySelector("svg")!;
    const next = canvas.getByRole("button", { name: "Go to the Next Month" }).querySelector("svg")!;
    const previousPoint = previous.querySelector<SVGPolygonElement>("polygon")!.points.getItem(4);
    const nextPoint = next.querySelector<SVGPolygonElement>("polygon")!.points.getItem(4);
    const previousTip = new DOMPoint(previousPoint.x, previousPoint.y).matrixTransform(previous.getScreenCTM()!);
    const nextTip = new DOMPoint(nextPoint.x, nextPoint.y).matrixTransform(next.getScreenCTM()!);
    await expect(previousTip.x).toBeGreaterThan(
      previous.getBoundingClientRect().left + previous.getBoundingClientRect().width / 2,
    );
    await expect(nextTip.x).toBeLessThan(next.getBoundingClientRect().left + next.getBoundingClientRect().width / 2);
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Saturday, October 10th, 2026" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected day")).toHaveTextContent("10");
  },
};

function PricedCalendarDayButton({
  children,
  day,
  modifiers,
  ...props
}: ComponentProps<typeof CalendarDayButton>): ReactElement {
  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  return (
    <CalendarDayButton day={day} modifiers={modifiers} {...props} className="flex-col gap-1">
      {children}
      {!modifiers.outside && (
        <span className={cn("text-xs", !modifiers.selected && "text-muted-foreground")}>
          {isWeekend ? "$120" : "$100"}
        </span>
      )}
    </CalendarDayButton>
  );
}

export const CustomCellSize: Story = {
  args: { className: "[--cell-size:3rem]", components: { DayButton: PricedCalendarDayButton } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = canvas.getByRole("button", { name: "Friday, October 9th, 2026" });
    await expect(day.getBoundingClientRect().width).toBe(48);
    await expect(day.getBoundingClientRect().height).toBe(48);
    await expect(day.closest("td")!.getBoundingClientRect().width).toBe(48);
    await expect(day).toHaveTextContent("$100");
    await expect(canvas.getByRole("button", { name: "Saturday, October 10th, 2026" })).toHaveTextContent("$120");
    await expect(canvas.getByRole("button", { name: "Go to the Next Month" }).getBoundingClientRect().height).toBe(48);
    await userEvent.click(day);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByLabelText("Selected day")).toHaveTextContent("16");
  },
};
export const RightToLeftCustomCellSize: Story = { ...CustomCellSize, args: { ...CustomCellSize.args, dir: "rtl" } };

export const BookedDates: Story = {
  args: {
    disabled: [new Date(2026, 9, 10), new Date(2026, 9, 11)],
    modifiers: { booked: [new Date(2026, 9, 10), new Date(2026, 9, 11)] },
    modifiersClassNames: { booked: "[&>button]:line-through" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const booked = canvas.getByRole("button", { name: "Saturday, October 10th, 2026" });
    await expect(booked).toBeDisabled();
    await expect(getComputedStyle(booked).textDecorationLine).toBe("line-through");
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    const keys: Record<string, string> = { ltr: "{ArrowRight}", rtl: "{ArrowLeft}" };
    await userEvent.keyboard(keys[getComputedStyle(booked).direction]);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Monday, October 12th, 2026" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected day")).toHaveTextContent("12");
  },
};
export const RightToLeftBookedDates: Story = { ...BookedDates, args: { ...BookedDates.args, dir: "rtl" } };

export const WeekNumbers: Story = {
  args: { showWeekNumber: true },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("rowheader", { name: "Week 40" })).toBeVisible();
    const weekday = canvas.getByLabelText("Sunday");
    const date = canvas.getByRole("button", { name: "Sunday, October 4th, 2026" });
    await expect(weekday.getBoundingClientRect().left).toBeCloseTo(date.getBoundingClientRect().left, 0);
    await expect(weekday.getBoundingClientRect().width).toBeCloseTo(date.getBoundingClientRect().width, 0);
    const weekText = getTextBounds(canvas.getByRole("rowheader", { name: "Week 41" }));
    const dayText = getTextBounds(date);
    await expect(weekText.top + weekText.height / 2).toBeCloseTo(dayText.top + dayText.height / 2, 0);
    await Default.play?.(context);
  },
};

function getTextBounds(element: HTMLElement): DOMRect {
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}
export const RightToLeftWeekNumbers: Story = {
  ...WeekNumbers,
  args: { showWeekNumber: true, dir: "rtl" },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("rowheader", { name: "Week 40" })).toBeVisible();
    const weekText = getTextBounds(canvas.getByRole("rowheader", { name: "Week 41" }));
    const dayText = getTextBounds(canvas.getByRole("button", { name: "Sunday, October 4th, 2026" }));
    await expect(weekText.top + weekText.height / 2).toBeCloseTo(dayText.top + dayText.height / 2, 0);
    await RightToLeft.play?.(context);
  },
};

export const TimeZone: Story = {
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new TZDate(2026, 9, 8, "Pacific/Kiritimati"));
    return (
      <div>
        <Calendar
          {...args}
          mode="single"
          timeZone="Pacific/Kiritimati"
          defaultMonth={new TZDate(2026, 9, 1, "Pacific/Kiritimati")}
          today={new TZDate(2026, 9, 8, "Pacific/Kiritimati")}
          selected={date}
          onSelect={setDate}
        />
        <output aria-label="Selected instant">{date?.toISOString()}</output>
        <output aria-label="Selected zoned date">
          {date && new Intl.DateTimeFormat("en-US", { timeZone: "Pacific/Kiritimati", dateStyle: "long" }).format(date)}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await expect(canvas.getByLabelText("Selected zoned date")).toHaveTextContent("October 9, 2026");
    const instant = canvas.getByLabelText("Selected instant").textContent;
    await expect(new Date(instant!).toISOString()).toBe("2026-10-08T10:00:00.000Z");
    await expect(
      canvas.getByRole("button", { name: "Friday, October 9th, 2026, selected" }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
  },
};
export const RightToLeftTimeZone: Story = { ...TimeZone, args: { dir: "rtl" } };

export const Presets: Story = {
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8));
    const [month, setMonth] = useState(new Date(2026, 9, 1));
    return (
      <Card className="w-fit">
        <CardHeader>
          <CardTitle>Schedule a reminder</CardTitle>
          <CardDescription>Choose a date or a preset.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            {...args}
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={date}
            onSelect={setDate}
            fixedWeeks
          />
        </CardContent>
        <CardFooter className="flex-col items-start gap-control-gap">
          <ToggleGroup
            aria-label="Reminder presets"
            onValueChange={(values) => {
              const offsets: Record<string, number> = { today: 0, tomorrow: 1, fortnight: 14 };
              const offset = offsets[values[0] ?? ""];
              if (offset !== undefined) {
                const next = new Date(2026, 9, 8 + offset);
                setDate(next);
                setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
              }
            }}
          >
            <ToggleGroupItem value="today">Today</ToggleGroupItem>
            <ToggleGroupItem value="tomorrow">Tomorrow</ToggleGroupItem>
            <ToggleGroupItem value="fortnight">In two weeks</ToggleGroupItem>
          </ToggleGroup>
          <output aria-label="Reminder date">{date && formatDate(date)}</output>
        </CardFooter>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Go to the Next Month" }));
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Tomorrow" }));
    await expect(canvas.getByRole("grid", { name: "October 2026" })).toBeVisible();
    await expect(canvas.getByLabelText("Reminder date")).toHaveTextContent("October 9, 2026");
    await userEvent.click(canvas.getByRole("button", { name: "In two weeks" }));
    await expect(canvas.getByLabelText("Reminder date")).toHaveTextContent("October 22, 2026");
    await expect(
      canvas.getByRole("button", { name: "Thursday, October 22nd, 2026, selected" }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
  },
};
export const RightToLeftPresets: Story = { ...Presets, args: { dir: "rtl" } };

export const TimeInputs: Story = {
  render: function Render(args) {
    const id = useId();
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8));
    const [start, setStart] = useState("10:30:00"),
      [end, setEnd] = useState("12:30:00");
    return (
      <Card className="w-fit">
        <CardHeader>
          <CardTitle>Book a session</CardTitle>
          <CardDescription>Choose a date and time interval.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
        </CardContent>
        <CardFooter className="flex-col items-start gap-panel">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={id + "-start"}>Start time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={id + "-start"}
                  type="time"
                  step="1"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
                <InputGroupAddon>
                  <Clock2Icon aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor={id + "-end"}>End time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={id + "-end"}
                  type="time"
                  step="1"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
                <InputGroupAddon>
                  <Clock2Icon aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
          <output aria-label="Session interval">
            {date && formatDate(date)} {start} – {end}
          </output>
        </CardFooter>
      </Card>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.clear(canvas.getByLabelText("Start time"));
    await userEvent.type(canvas.getByLabelText("Start time"), "11:15");
    await userEvent.clear(canvas.getByLabelText("End time"));
    await userEvent.type(canvas.getByLabelText("End time"), "13:45");
    await expect(canvas.getByLabelText("Session interval")).toHaveTextContent("October 9, 2026 11:15 – 13:45");
  },
};
export const RightToLeftTimeInputs: Story = { ...TimeInputs, args: { dir: "rtl" } };

type DatePickerCompositionProps = CalendarStoryProps & { hasTime?: boolean; hasPresets?: boolean };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}

function DatePickerComposition({
  hasTime = false,
  hasPresets = false,
  ...args
}: DatePickerCompositionProps): ReactElement {
  const id = useId();
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState("09:30");
  const selectDate = (selected: Date | undefined): void => {
    setDate(selected);
    setIsOpen(false);
  };
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={id}>Appointment date</FieldLabel>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger
            id={id}
            aria-describedby={id + "-selected"}
            render={<Button density={args.density} variant="outline" />}
          >
            <CalendarIcon data-icon="inline-start" aria-hidden />
            {date ? formatDate(date) : "Choose date"}
          </PopoverTrigger>
          <PopoverContent density={args.density} className="w-auto p-0" align="start">
            <PopoverTitle className="sr-only">Choose an appointment date</PopoverTitle>
            {hasPresets && (
              <ToggleGroup
                aria-label="Date presets"
                onValueChange={(values) => {
                  if (values[0] === "today") selectDate(new Date(2026, 9, 8));
                  if (values[0] === "tomorrow") selectDate(new Date(2026, 9, 9));
                }}
              >
                <ToggleGroupItem value="today">Today</ToggleGroupItem>
                <ToggleGroupItem value="tomorrow">Tomorrow</ToggleGroupItem>
              </ToggleGroup>
            )}
            <Calendar {...args} mode="single" selected={date} onSelect={selectDate} autoFocus />
          </PopoverContent>
        </Popover>
      </Field>
      {hasTime && (
        <Field>
          <FieldLabel htmlFor={id + "-time"}>Appointment time</FieldLabel>
          <Input
            density={args.density}
            id={id + "-time"}
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </Field>
      )}
      <output id={id + "-selected"} aria-label="Selected appointment">
        {date ? formatDate(date) : "No date"}
        {hasTime && " at " + time}
      </output>
    </FieldGroup>
  );
}

export const DatePicker: Story = {
  render: (args) => <DatePickerComposition {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Appointment date" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Choose an appointment date",
    });
    await expect(getComputedStyle(dialog).direction).toBe(args.dir ?? "ltr");
    const day = within(dialog).getByRole("button", { name: "Friday, October 9th, 2026" });
    await userEvent.click(day);
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 9, 2026");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveTextContent("October 9, 2026");
    await expect(trigger).toHaveAccessibleDescription(/October 9, 2026/);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DatePickerCompact: Story = {
  ...DatePicker,
  args: { density: "compact" },
};

export const DatePickerRtl: Story = {
  ...DatePicker,
  args: { dir: "rtl" },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Appointment date" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Choose an appointment date" });
    await expect(dialog).toHaveAttribute("dir", "rtl");
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Today, Thursday, October 8th, 2026" })).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Friday, October 9th, 2026" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 9, 2026");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DatePickerPresets: Story = {
  render: (args) => <DatePickerComposition {...args} hasPresets />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Appointment date" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Choose an appointment date",
    });
    await expect(getComputedStyle(dialog).direction).toBe(args.dir ?? "ltr");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tomorrow" }));
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 9, 2026");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const DatePickerTime: Story = {
  render: (args) => <DatePickerComposition {...args} hasTime />,
  play: async (context) => {
    await DatePicker.play?.(context);
    const canvas = within(context.canvasElement);
    const time = canvas.getByLabelText("Appointment time");
    await expect(time).toHaveAttribute("type", "time");
    await context.userEvent.clear(time);
    await context.userEvent.type(time, "13:45");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent(
      "October 9, 2026 at 13:45",
    );
  },
};

function RangePicker(args: CalendarStoryProps): ReactElement {
  const [range, setRange] = useState<DateRange>();
  const [isOpen, setIsOpen] = useState(false);
  const label = range?.from
    ? formatDate(range.from) + (range.to ? " – " + formatDate(range.to) : "")
    : "Choose date range";
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<Button density={args.density} variant="outline" />}>{label}</PopoverTrigger>
      <PopoverContent density={args.density} className="w-auto p-0">
        <PopoverTitle className="sr-only">Choose an appointment range</PopoverTitle>
        <Calendar
          {...args}
          mode="range"
          selected={range}
          min={1}
          numberOfMonths={2}
          autoFocus
          onSelect={(selected) => {
            setRange(selected);
            if (selected?.from && selected.to) setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export const DatePickerRange: Story = {
  render: (args) => <RangePicker {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Choose date range" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Choose an appointment range",
    });
    await expect(getComputedStyle(dialog).direction).toBe(args.dir ?? "ltr");
    const october = within(within(dialog).getByRole("grid", { name: "October 2026" }));
    await userEvent.click(october.getByRole("button", { name: "Today, Thursday, October 8th, 2026" }));
    await expect(dialog).toBeVisible();
    await userEvent.click(october.getByRole("button", { name: "Monday, October 12th, 2026" }));
    await expect(trigger).toHaveAccessibleName("October 8, 2026 – October 12, 2026");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function BirthDatePicker(args: CalendarStoryProps): ReactElement {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        {date ? formatDate(date) : "Choose date of birth"}
      </PopoverTrigger>
      <PopoverContent density={args.density} className="w-auto p-0">
        <PopoverTitle className="sr-only">Choose a birth date</PopoverTitle>
        <Calendar
          {...args}
          captionLayout="dropdown"
          startMonth={new Date(1920, 0)}
          endMonth={new Date(2026, 9)}
          disabled={{ after: new Date(2026, 9, 8) }}
          mode="single"
          selected={date}
          onSelect={(selected) => {
            setDate(selected);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export const DatePickerBirthDate: Story = {
  render: (args) => <BirthDatePicker {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Choose date of birth" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Choose a birth date" });
    await expect(getComputedStyle(dialog).direction).toBe(args.dir ?? "ltr");
    await userEvent.selectOptions(within(dialog).getByRole("combobox", { name: "Choose the Year" }), "2000");
    await userEvent.selectOptions(within(dialog).getByRole("combobox", { name: "Choose the Month" }), "5");
    await userEvent.click(within(dialog).getByRole("button", { name: "Thursday, June 15th, 2000" }));
    await expect(trigger).toHaveAccessibleName("June 15, 2000");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DatePickerInput: Story = {
  render: (args) => <DateInputPickerExample {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Subscription date" });
    await userEvent.type(input, "February 30, 2026");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a valid date.");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("No date");
    await userEvent.clear(input);
    await userEvent.type(input, "October 9, 2026");
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 9, 2026");
    await userEvent.click(canvas.getByRole("button", { name: "Select subscription date" }));
    const dialog = await body.findByRole("dialog", { name: "Choose an appointment date" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog).toHaveAttribute("dir", args.dir ?? "ltr");
    const day = within(dialog).getByRole("button", { name: "Friday, October 9th, 2026, selected" });
    await waitFor(() => expect(day).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Friday, October 16th, 2026" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(input).toHaveValue("October 16, 2026");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.clear(input);
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("No date");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Select subscription date" }));
    const clearedDialog = await body.findByRole("dialog", { name: "Choose an appointment date" });
    await waitFor(() => expect(clearedDialog).toBeVisible());
    await waitFor(() =>
      expect(within(clearedDialog).getByRole("button", { name: "Today, Thursday, October 8th, 2026" })).toHaveFocus(),
    );
    await expect(clearedDialog.querySelector('[aria-selected="true"]')).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(clearedDialog).not.toBeInTheDocument());
    await waitFor(() => expect(input).toHaveFocus());
  },
};
export const DatePickerInputCompact: Story = { ...DatePickerInput, args: { density: "compact" } };
export const DatePickerInputRtl: Story = {
  ...DatePickerInput,
  args: { dir: "rtl" },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
};
export const DatePickerNaturalLanguage: Story = {
  render: (args) => <DateInputPickerExample {...args} isNaturalLanguage />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Schedule date" });
    await userEvent.type(input, "tomorrow");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 9, 2026");
    await userEvent.clear(input);
    await userEvent.type(input, "next week");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("October 15, 2026");
    await userEvent.click(canvas.getByRole("button", { name: "Select schedule date" }));
    const dialog = await body.findByRole("dialog", { name: "Choose an appointment date" });
    await expect(getComputedStyle(dialog).direction).toBe(args.dir ?? "ltr");
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Thursday, October 15th, 2026, selected" })).toHaveFocus(),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Go to the Next Month" }));
    await expect(within(dialog).getByRole("grid", { name: "November 2026" })).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Friday, November 20th, 2026" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(input).toHaveValue("November 20, 2026");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("November 20, 2026");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.clear(input);
    await userEvent.type(input, "whenever");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a valid date.");
    await expect(canvas.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("No date");
    await userEvent.clear(input);
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

export const DatePickerPresetsRtl: Story = {
  ...DatePickerPresets,
  args: { dir: "rtl" },
  decorators: DatePickerRtl.decorators,
};
export const DatePickerTimeRtl: Story = {
  ...DatePickerTime,
  args: { dir: "rtl" },
  decorators: DatePickerRtl.decorators,
};
export const DatePickerRangeRtl: Story = {
  ...DatePickerRange,
  args: { dir: "rtl" },
  decorators: DatePickerRtl.decorators,
};
export const DatePickerBirthDateRtl: Story = {
  ...DatePickerBirthDate,
  args: { dir: "rtl" },
  decorators: DatePickerRtl.decorators,
};
export const DatePickerNaturalLanguageRtl: Story = {
  ...DatePickerNaturalLanguage,
  args: { dir: "rtl" },
  decorators: DatePickerRtl.decorators,
};
