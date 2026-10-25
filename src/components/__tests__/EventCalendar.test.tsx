import { expect, onTestFinished, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { EventCalendar } from "../event-calendar/EventCalendar.js";
import "../../../.storybook/preview.css";
import "../event-calendar/event-calendar.css";

test("uncontrolled calendar navigates and selects events without React warnings", async () => {
  const warnings = vi.spyOn(console, "warn");
  const errors = vi.spyOn(console, "error");
  onTestFinished(() => {
    warnings.mockRestore();
    errors.mockRestore();
  });
  const event = { title: "Design review", start: new Date(2026, 9, 22, 10), end: new Date(2026, 9, 22, 11) };
  const onNavigate = vi.fn();
  const onView = vi.fn();
  const onSelectEvent = vi.fn();
  const screen = await render(
    <EventCalendar
      label="Team calendar"
      events={[event]}
      defaultDate={new Date(2026, 9, 22)}
      defaultView="month"
      views={["month", "week", "agenda"]}
      onNavigate={onNavigate}
      onView={onView}
      onSelectEvent={onSelectEvent}
    />,
  );
  await screen.getByRole("button", { name: "Design review" }).click();
  expect(onSelectEvent).toHaveBeenCalledWith(event, expect.anything());
  await screen.getByRole("button", { name: "Next" }).click();
  await expect.element(screen.getByRole("heading")).toHaveTextContent("November 2026");
  expect(onNavigate).toHaveBeenLastCalledWith(expect.any(Date), "month", "NEXT");
  await screen.getByRole("button", { name: "Back" }).click();
  await expect.element(screen.getByRole("heading")).toHaveTextContent("October 2026");
  await screen.getByRole("button", { name: "Week", exact: true }).click();
  expect(onView).toHaveBeenLastCalledWith("week");
  await expect
    .element(screen.getByRole("button", { name: "Week", exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await screen.unmount();
  expect(warnings).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
});

test("controlled calendar waits for its owner to commit date and view changes", async () => {
  const onNavigate = vi.fn();
  const onView = vi.fn();
  const date = new Date(2026, 9, 22);
  const screen = await render(
    <EventCalendar
      label="Controlled calendar"
      date={date}
      view="month"
      events={[]}
      views={["month", "week"]}
      onNavigate={onNavigate}
      onView={onView}
    />,
  );
  await screen.getByRole("button", { name: "Next" }).click();
  expect(onNavigate).toHaveBeenLastCalledWith(expect.any(Date), "month", "NEXT");
  await expect.element(screen.getByRole("heading")).toHaveTextContent("October 2026");
  await screen.getByRole("button", { name: "Week", exact: true }).click();
  expect(onView).toHaveBeenLastCalledWith("week");
  await expect
    .element(screen.getByRole("button", { name: "Month", exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await screen.rerender(
    <EventCalendar
      label="Controlled calendar"
      date={new Date(2026, 10, 22)}
      view="week"
      events={[]}
      views={["month", "week"]}
      onNavigate={onNavigate}
      onView={onView}
    />,
  );
  await expect
    .element(screen.getByRole("button", { name: "Week", exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await screen.unmount();
});
