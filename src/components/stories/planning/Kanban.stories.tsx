import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { useState } from "react";
import { Kanban, type KanbanItem } from "../../Kanban";
import { chooseOption } from "../helpers";
const columns = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];
function Example({ disabled = false, restricted = false }: { disabled?: boolean; restricted?: boolean }) {
  const [items, setItems] = useState<KanbanItem[]>([
    { id: "a", title: "Design", columnId: "todo" },
    { id: "b", title: "Build", columnId: "todo" },
    { id: "c", title: "Review", columnId: "doing" },
  ]);
  return (
    <Kanban
      label="Sprint board"
      columns={columns}
      items={items}
      onItemsChange={setItems}
      disabled={disabled}
      canMove={restricted ? (_, column) => column !== "done" : undefined}
    />
  );
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/planning/Kanban",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    const todo = within(c.getByRole("region", { name: "To do" }));
    await userEvent.click(c.getByRole("button", { name: "Move Build up" }));
    await expect(todo.getAllByRole("listitem")[0]).toHaveTextContent("Build");
    await userEvent.click(c.getByRole("button", { name: "Move Build down" }));
    await expect(todo.getAllByRole("listitem")[0]).toHaveTextContent("Design");
    await chooseOption(c.getByRole("combobox", { name: "Move Design to" }), "In progress");
    await expect(
      within(c.getByRole("region", { name: "In progress" })).getByRole("group", { name: "Design" }),
    ).toBeVisible();
    await expect(c.getByLabelText("To do count")).toHaveTextContent("1");
  },
};
export const Disabled: Story = {
  render: () => <Example disabled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("combobox", { name: "Move Design to" })).toBeDisabled();
    await expect(c.getByRole("group", { name: "Design" })).toHaveAttribute("draggable", "false");
  },
};
export const Restricted: Story = {
  render: () => <Example restricted />,
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Move Design to" }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("option", { name: "Done" })).toHaveAttribute("aria-disabled", "true");
  },
};
