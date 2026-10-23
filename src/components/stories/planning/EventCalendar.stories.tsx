import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { EventCalendar } from "../../event-calendar";
import "../../event-calendar/event-calendar.css";
const events = [
  { id: "design", title: "Design review", start: new Date(2026, 9, 22, 10), end: new Date(2026, 9, 22, 11) },
  { id: "launch", title: "Launch", start: new Date(2026, 9, 23), end: new Date(2026, 9, 24), allDay: true },
];
const meta: Meta<typeof EventCalendar> = {
  title: "@alexgorbatchev/shadcn/components/planning/EventCalendar",
  component: EventCalendar,
  tags: ["autodocs", "test"],
  args: {
    label: "Team calendar",
    events,
    defaultDate: new Date(2026, 9, 22),
    defaultView: "month",
    views: ["month", "week", "day", "agenda"],
    onSelectEvent: fn(),
    onView: fn(),
    onNavigate: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Design review" }));
    await expect(args.onSelectEvent).toHaveBeenCalledWith(events[0], expect.anything());
    await userEvent.click(c.getByRole("button", { name: "Week" }));
    await expect(args.onView).toHaveBeenLastCalledWith("week");
    await expect(c.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(c.getByRole("button", { name: "Day" }));
    await expect(c.getByRole("button", { name: /Design review/ })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Agenda" }));
    await waitFor(() => expect(c.getByText("Design review")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Month" }));
    await userEvent.click(c.getByRole("button", { name: "Next" }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith(expect.any(Date), "month", "NEXT");
    await userEvent.click(c.getByRole("button", { name: "Back" }));
    await expect(c.getByRole("heading")).toHaveTextContent("October 2026");
    await userEvent.click(c.getByRole("button", { name: "Today" }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith(expect.any(Date), "month", "TODAY");
  },
};
export const KeyboardSelection: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Design review" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelectEvent).toHaveBeenCalledWith(events[0], expect.anything());
  },
};
export const CustomMessages: Story = {
  args: {
    messages: {
      previous: "Précédent",
      next: "Suivant",
      today: "Aujourd’hui",
      month: "Mois",
      week: "Semaine",
      day: "Jour",
      agenda: "Agenda",
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Suivant" }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith(expect.any(Date), "month", "NEXT");
    await userEvent.click(c.getByRole("button", { name: "Précédent" }));
    await expect(c.getByRole("heading")).toHaveTextContent("October 2026");
    await userEvent.click(c.getByRole("button", { name: "Semaine" }));
    await expect(args.onView).toHaveBeenLastCalledWith("week");
  },
};
