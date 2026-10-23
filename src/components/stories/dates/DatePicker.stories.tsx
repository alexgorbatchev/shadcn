import { fr } from "@daypicker/react/locale/fr";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { DatePicker, DateRangePicker } from "../../calendar/DatePicker";
import { Button } from "../../Button";
const meta: Meta<typeof DatePicker> = {
  title: "@alexgorbatchev/shadcn/components/dates/DatePicker",
  component: DatePicker,
  tags: ["autodocs", "test"],
  args: {
    label: "Appointment date",
    calendarProps: { defaultMonth: new Date(2026, 9), today: new Date(2026, 9, 8) },
    onValueChange: fn(),
  },
  render: (args) => <DatePicker {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Appointment date" });
    await userEvent.click(trigger);
    await userEvent.click(await page.findByRole("button", { name: "Friday, October 9th, 2026" }));
    await expect(trigger).toHaveTextContent("Oct 9, 2026");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 9));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Appointment date" })).toBeDisabled();
  },
};
function ControlledExample(): ReactElement {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 9, 9));
  return (
    <>
      <DatePicker
        label="Controlled date"
        value={value}
        onValueChange={setValue}
        name="date"
        calendarProps={{ defaultMonth: new Date(2026, 9) }}
      />
      <Button onClick={() => setValue(undefined)}>Clear date</Button>
    </>
  );
}
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Controlled date" })).toHaveTextContent("Oct 9, 2026");
    await userEvent.click(canvas.getByRole("button", { name: "Clear date" }));
    await expect(canvas.getByRole("button", { name: "Controlled date" })).toHaveTextContent("Choose date");
  },
};
export const Range: Story = {
  render: () => (
    <DateRangePicker
      label="Reporting period"
      startName="start"
      endName="end"
      calendarProps={{ defaultMonth: new Date(2026, 9), today: new Date(2026, 9, 8) }}
    />
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Reporting period" });
    await userEvent.click(trigger);
    await userEvent.click(await page.findByRole("button", { name: "Friday, October 9th, 2026" }));
    await userEvent.click(page.getByRole("button", { name: "Monday, October 12th, 2026" }));
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveTextContent(/Oct 9\s+–\s+12, 2026/);
  },
};
export const FormValues: Story = {
  render: () => (
    <form aria-label="Dates">
      <DatePicker label="Appointment" name="appointment" defaultValue={new Date(2026, 9, 9)} />
      <DateRangePicker
        label="Period"
        startName="start"
        endName="end"
        defaultValue={{ from: new Date(2026, 9, 9), to: new Date(2026, 9, 12) }}
      />
      <DatePicker label="Unavailable date" name="disabled-date" defaultValue={new Date(2026, 9, 9)} disabled />
      <DateRangePicker
        label="Unavailable period"
        startName="disabled-start"
        endName="disabled-end"
        defaultValue={{ from: new Date(2026, 9, 9) }}
        disabled
      />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = within(canvasElement).getByRole("form", { name: "Dates" }) as HTMLFormElement;
    const data = new FormData(form);
    await expect(Object.fromEntries(data)).toEqual({
      appointment: "2026-10-09",
      start: "2026-10-09",
      end: "2026-10-12",
    });
  },
};

export const Localized: Story = {
  render: () => <DatePicker label="Date française" locale={fr} defaultValue={new Date(2026, 9, 9)} />,
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole("button", { name: "Date française" });
    await expect(trigger).toHaveTextContent("9 oct. 2026");
    await userEvent.click(trigger);
    const day = await within(canvasElement.ownerDocument.body).findByRole("button", {
      name: /vendredi 9 octobre 2026/i,
    });
    await userEvent.click(day);
    await expect(trigger).toHaveTextContent("Choose date");
  },
};
