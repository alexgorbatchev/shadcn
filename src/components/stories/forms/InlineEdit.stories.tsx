import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, mocked, within, waitFor } from "storybook/test";
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
    await expect(within(canvasElement).getByRole("textbox")).not.toHaveFocus();
  },
};
export const FailedSave: Story = {
  args: {
    onCommit: async () => {
      throw new Error("Private storage diagnostic");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.keyboard("{Enter}");
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("Could not save this edit.");
    await expect(canvasElement).not.toHaveTextContent("Private storage diagnostic");
  },
};
export const UnchangedEnter: Story = {
  args: { hasChanges: false },
  play: async ({ userEvent, args }) => {
    await userEvent.keyboard("{Enter}");
    await expect(args.onCancel).toHaveBeenCalledOnce();
    await expect(args.onCommit).not.toHaveBeenCalled();
  },
};
export const UnchangedBlur: Story = {
  args: { hasChanges: false },
  play: async ({ userEvent, args }) => {
    await userEvent.tab();
    await expect(args.onCancel).toHaveBeenCalledOnce();
    await expect(args.onCommit).not.toHaveBeenCalled();
  },
};
export const UnchangedCreate: Story = {
  play: async ({ userEvent, args }) => {
    await userEvent.keyboard("{Enter}");
    await expect(args.onCommit).toHaveBeenCalledWith("New playlist");
    await expect(args.onCancel).not.toHaveBeenCalled();
  },
};
export const AuthoredValidationAndRetry: Story = {
  args: {
    onCommit: fn(),
    renderError: () => "A title is required.",
  },
  play: async ({ canvasElement, userEvent, args }) => {
    mocked(args.onCommit).mockRejectedValueOnce(new Error("Private storage diagnostic")).mockResolvedValue(undefined);
    await userEvent.keyboard("{Enter}");
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("A title is required.");
    await expect(canvasElement).not.toHaveTextContent("Private storage diagnostic");
    await userEvent.click(within(canvasElement).getByRole("textbox"));
    await userEvent.clear(within(canvasElement).getByRole("textbox"));
    await userEvent.keyboard("Corrected{Enter}");
    await waitFor(() => expect(within(canvasElement).queryByRole("alert")).not.toBeInTheDocument());
    await expect(args.onCommit).toHaveBeenCalledTimes(2);
    await expect(args.onCommit).toHaveBeenLastCalledWith("Corrected");
  },
};
