import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ThreadList } from "../../../../assistant-ui/elements/ThreadList.js";
const meta: Meta<typeof ThreadList> = {
  component: ThreadList,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/ThreadList",
  render: (args) => <ThreadList {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    threads: [
      { id: "one", title: "Workspace review", time: "Today" },
      { id: "two", title: "API design", time: "Yesterday", unread: true },
    ],
    activeIndex: 0,
    onActiveIndexChange: fn(),
    onRename: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^API design/ }));
    await expect(args.onActiveIndexChange).toHaveBeenCalledWith(1);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ReadOnly: Story = {
  args: { threads: Default.args?.threads, activeIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("API design")).toBeVisible();
    await expect(canvas.getByText("unread")).toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const RenameOnly: Story = {
  args: { ...ReadOnly.args, onRename: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Rename API design" }));
    await expect(args.onRename).toHaveBeenCalledWith(1);
  },
};
export const DeleteOnly: Story = {
  args: { ...ReadOnly.args, onDelete: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete API design" }));
    await expect(args.onDelete).toHaveBeenCalledWith(1);
  },
};
export const ActionsWithoutSelection: Story = {
  args: { ...RenameOnly.args, onDelete: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete Workspace review" }));
    await expect(args.onDelete).toHaveBeenCalledWith(0);
  },
};
export const SelectWithRename: Story = {
  args: { ...RenameOnly.args, onActiveIndexChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^API design/ }));
    await expect(args.onActiveIndexChange).toHaveBeenCalledWith(1);
    await userEvent.click(canvas.getByRole("button", { name: "Rename API design" }));
    await expect(args.onRename).toHaveBeenCalledWith(1);
  },
};
