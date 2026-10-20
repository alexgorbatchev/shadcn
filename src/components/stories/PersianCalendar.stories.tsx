import type { ComponentProps } from "react";
import type { DateRange } from "@daypicker/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { enUS } from "@daypicker/persian";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PersianCalendar } from "../persian-calendar/PersianCalendar";

type PersianCalendarStoryProps = Omit<
  ComponentProps<typeof PersianCalendar>,
  "mode" | "required" | "selected" | "onSelect"
>;
const meta: Meta<PersianCalendarStoryProps> = {
  title: "shadcn-alexgorbatchev/components/PersianCalendar",
  component: PersianCalendar,
  tags: ["autodocs", "test"],
  args: { defaultMonth: new Date(2026, 9, 8), today: new Date(2026, 9, 8) },
  argTypes: { density: { control: "select", options: ["compact", "comfortable"] } },
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8));
    return (
      <div>
        <PersianCalendar {...args} mode="single" selected={date} onSelect={setDate} />
        <output aria-label="Gregorian selection">{date?.toLocaleDateString("en-CA")}</output>
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid", { name: "مهر ۱۴۰۵" });
    await expect(getComputedStyle(grid).direction).toBe("rtl");
    const selected = canvas.getByRole("button", { name: "امروز، پنج‌شنبه ۱۶-ام مهر ۱۴۰۵، انتخاب شده" });
    await expect(selected).toHaveTextContent("۱۶");
    await userEvent.click(selected);
    await userEvent.keyboard("{ArrowLeft}");
    const next = canvas.getByRole("button", { name: "جمعه ۱۷-ام مهر ۱۴۰۵" });
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Gregorian selection")).toHaveTextContent("2026-10-09");
    await userEvent.click(canvas.getByRole("button", { name: "رفتن به ماه بعد" }));
    await expect(canvas.getByRole("grid", { name: "آبان ۱۴۰۵" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "رفتن به ماه قبل" }));
    await expect(canvas.getByRole("grid", { name: "مهر ۱۴۰۵" })).toBeVisible();
  },
};

export const Compact: Story = {
  ...Default,
  args: { density: "compact" },
  play: async (context) => {
    await Default.play?.(context);
    const selected = within(context.canvasElement).getByRole("button", { name: "جمعه ۱۷-ام مهر ۱۴۰۵، انتخاب شده" });
    await expect(selected.getBoundingClientRect().height).toBe(20);
  },
};

export const English: Story = {
  args: { locale: enUS, dir: "ltr", numerals: "latn" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByRole("grid", { name: "Mehr 1405" })).direction).toBe("ltr");
    await userEvent.click(canvas.getByRole("button", { name: "Today, Thursday, Mehr 16th, 1405, selected" }));
    await userEvent.keyboard("{ArrowRight}");
    const next = canvas.getByRole("button", { name: "Friday, Mehr 17th, 1405" });
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Gregorian selection")).toHaveTextContent("2026-10-09");
  },
};

export const Dropdowns: Story = {
  args: { captionLayout: "dropdown", startMonth: new Date(2026, 2, 21), endMonth: new Date(2027, 2, 20) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const month = canvas.getByRole("combobox", { name: "ماه را انتخاب کنید" });
    await expect(within(month).getByRole("option", { name: "مهر" })).toHaveProperty("selected", true);
    await userEvent.selectOptions(month, within(month).getByRole("option", { name: "آبان" }));
    await expect(canvas.getByRole("grid", { name: "آبان ۱۴۰۵" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "یک‌شنبه ۱۰-ام آبان ۱۴۰۵" }));
    await expect(canvas.getByLabelText("Gregorian selection")).toHaveTextContent("2026-11-01");
  },
};

export const Range: Story = {
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>();
    return (
      <div>
        <PersianCalendar {...args} mode="range" selected={range} onSelect={setRange} />
        <output aria-label="Gregorian range">
          {range?.from?.toLocaleDateString("en-CA")} – {range?.to?.toLocaleDateString("en-CA")}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "جمعه ۱۷-ام مهر ۱۴۰۵" }));
    await userEvent.click(canvas.getByRole("button", { name: "دوشنبه ۲۰-ام مهر ۱۴۰۵" }));
    await expect(canvas.getByLabelText("Gregorian range")).toHaveTextContent("2026-10-09 – 2026-10-12");
    await expect(canvas.getByRole("button", { name: "شنبه ۱۸-ام مهر ۱۴۰۵، انتخاب شده" }).closest("td")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const EnglishDropdowns: Story = {
  args: { ...Dropdowns.args, ...English.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const month = canvas.getByRole("combobox", { name: "Choose the Month" });
    await expect(within(month).getByRole("option", { name: "Mehr" })).toHaveProperty("selected", true);
    await userEvent.selectOptions(month, within(month).getByRole("option", { name: "Aban" }));
    await expect(canvas.getByRole("grid", { name: "Aban 1405" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sunday, Aban 10th, 1405" }));
    await expect(canvas.getByLabelText("Gregorian selection")).toHaveTextContent("2026-11-01");
  },
};

export const DisabledDates: Story = {
  args: { disabled: new Date(2026, 9, 9) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "جمعه ۱۷-ام مهر ۱۴۰۵" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "امروز، پنج‌شنبه ۱۶-ام مهر ۱۴۰۵، انتخاب شده" }));
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "شنبه ۱۸-ام مهر ۱۴۰۵" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Gregorian selection")).toHaveTextContent("2026-10-10");
  },
};
