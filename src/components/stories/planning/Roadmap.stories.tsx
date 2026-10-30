import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { useState } from "react";
import { Roadmap, type RoadmapItem } from "../../gantt";
import { chooseOption } from "../helpers";
const select = fn();
function Example() {
  const [items, setItems] = useState<RoadmapItem[]>([
    {
      id: "design",
      title: "Design",
      columnId: "todo",
      start: new Date(2026, 9, 20),
      end: new Date(2026, 9, 23),
      progress: 25,
    },
  ]);
  return (
    <Roadmap
      label="Product roadmap"
      items={items}
      columns={[
        { id: "todo", label: "To do" },
        { id: "done", label: "Done" },
      ]}
      startDate={new Date(2026, 9, 20)}
      days={14}
      onItemsChange={setItems}
      onItemSelect={select}
    />
  );
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/planning/Roadmap",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await chooseOption(c.getByRole("combobox", { name: "Move Design to" }), "Done");
    await userEvent.click(c.getByRole("button", { name: "Design" }));
    await expect(select).toHaveBeenCalledWith(expect.objectContaining({ columnId: "done" }));
    await userEvent.click(c.getByRole("tab", { name: "Timeline" }));
    await userEvent.click(c.getByRole("button", { name: "Move Design one day later" }));
    await userEvent.click(c.getByRole("tab", { name: "List" }));
    await expect(c.getByRole("table")).toHaveTextContent("Done");
    await expect(c.getByRole("table")).toHaveTextContent("Oct 21, 2026");
    await userEvent.click(c.getByRole("button", { name: "Design" }));
    await expect(select).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnId: "done", start: new Date(2026, 9, 21) }),
    );
  },
};
