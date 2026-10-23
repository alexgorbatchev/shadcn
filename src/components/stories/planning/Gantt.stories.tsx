import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { useState } from "react";
import { Gantt, type GanttTask } from "../../gantt";
const tasks: GanttTask[] = [
  {
    id: "design",
    title: "Design",
    start: new Date("2026-10-20T10:00:00Z"),
    end: new Date("2026-10-23T10:00:00Z"),
    progress: 50,
  },
  { id: "build", title: "Build", start: new Date("2026-10-23T10:00:00Z"), end: new Date("2026-10-28T10:00:00Z") },
];
const select = fn();
function Example({ readOnly = false }: { readOnly?: boolean }) {
  const [value, setValue] = useState(tasks);
  return (
    <Gantt
      label="Delivery plan"
      tasks={value}
      startDate={new Date("2026-10-20T00:00:00Z")}
      days={14}
      timeZone="UTC"
      onTaskSelect={select}
      onTaskChange={
        readOnly
          ? undefined
          : (task) => setValue((current) => current.map((item) => (item.id === task.id ? task : item)))
      }
    />
  );
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/planning/Gantt",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Move Design one day later" }));
    await expect(c.getByRole("button", { name: /Design: October 21st, 2026 to October 24th, 2026/ })).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Move Design one day earlier" }));
    await userEvent.click(c.getByRole("button", { name: "Design" }));
    await expect(select).toHaveBeenCalled();
    await userEvent.selectOptions(c.getByRole("combobox", { name: "Timeline zoom" }), "week");
    await expect(c.getByRole("table")).toBeVisible();
    await userEvent.selectOptions(c.getByRole("combobox"), "month");
    await expect(c.getByRole("table")).toBeVisible();
  },
};
export const ReadOnly: Story = {
  render: () => <Example readOnly />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Move Build one day earlier" })).toBeDisabled();
  },
};
export const Empty: Story = {
  render: () => (
    <Gantt label="Empty plan" tasks={[]} startDate={new Date(2026, 9, 20)} days={7} onTaskSelect={select} />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("table")).toHaveTextContent("No tasks scheduled.");
  },
};
export const DaylightSaving: Story = {
  render: () => {
    const [value, setValue] = useState([
      { id: "dst", title: "DST task", start: new Date("2026-03-07T17:00:00Z"), end: new Date("2026-03-08T16:00:00Z") },
    ]);
    return (
      <>
        <Gantt
          label="DST plan"
          tasks={value}
          startDate={new Date("2026-03-06T08:00:00Z")}
          days={7}
          timeZone="America/Los_Angeles"
          onTaskSelect={select}
          onTaskChange={(task) => setValue([task])}
        />
        <output aria-label="Start instant">{value[0]?.start.toISOString()}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Move DST task one day later" }));
    await expect(c.getByLabelText("Start instant")).toHaveTextContent("2026-03-08T16:00:00.000Z");
  },
};
