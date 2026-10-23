import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { FileUpload } from "../../file-upload";
const meta: Meta<typeof FileUpload> = {
  title: "@alexgorbatchev/shadcn/components/forms/FileUpload",
  component: FileUpload,
  tags: ["autodocs", "test"],
  args: {
    label: "Attachments",
    description: "Text files, up to 10 bytes each.",
    accept: { "text/plain": [".txt"] },
    maxSize: 10,
    onDrop: fn(),
    onDropRejected: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await userEvent.upload(c.getByLabelText("Attachments", { selector: "input" }), file);
    await waitFor(() => expect(args.onDrop).toHaveBeenCalledWith([file], [], expect.anything()));
    await expect(c.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Rejected: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const file = new File(["too many bytes for this input"], "long.txt", { type: "text/plain" });
    await userEvent.upload(c.getByLabelText("Attachments", { selector: "input" }), file);
    await waitFor(() => expect(c.getByRole("alert")).toHaveTextContent("long.txt"));
    await expect(args.onDropRejected).toHaveBeenCalledWith(
      [expect.objectContaining({ file, errors: [expect.objectContaining({ code: "file-too-large" })] })],
      expect.anything(),
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Choose files" })).toBeDisabled();
  },
};
