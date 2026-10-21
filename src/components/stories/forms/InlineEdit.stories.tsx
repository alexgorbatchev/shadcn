import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { InlineEdit } from "../../InlineEdit";

const meta: Meta<typeof InlineEdit> = {
  title: "@alexgorbatchev/shadcn/components/forms/InlineEdit",
  component: InlineEdit,
  tags: ["autodocs", "test"],
  args: { label: "Playlist title", value: "New playlist", onValueChange: fn(), onCommit: fn(), onCancel: fn() },
  render: function Example(args, { id }): ReactElement {
    const [value, setValue] = useState(args.value);
    return <InlineEdit key={id} {...args} value={value} onValueChange={setValue} />;
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Playlist title" });
    await expect(input).toHaveFocus();
    await userEvent.keyboard("House{Enter}");
    await expect(args.onCommit).toHaveBeenCalledWith("House");
  },
};
export const Cancel: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.keyboard("Changed{Escape}");
    await expect(args.onCancel).toHaveBeenCalledOnce();
    await expect(args.onCommit).not.toHaveBeenCalled();
    await expect(within(canvasElement).getByRole("textbox")).toHaveValue("Changed");
  },
};
export const FailedSave: Story = {
  args: {
    onCommit: async () => {
      throw new Error("Could not save");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.keyboard("{Enter}");
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("Could not save");
  },
};
