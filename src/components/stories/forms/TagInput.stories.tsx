import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { TagInput } from "../../TagInput";
const meta: Meta<typeof TagInput> = {
  title: "@alexgorbatchev/shadcn/components/forms/TagInput",
  component: TagInput,
  tags: ["autodocs", "test"],
  args: {
    label: "Project tags",
    options: ["Design", "Engineering", "Research"],
    defaultValue: ["Design"],
    onValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const input = c.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "Eng");
    await userEvent.click(within(document.body).getByRole("option", { name: "Engineering" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["Design", "Engineering"], expect.anything());
    await userEvent.click(c.getByRole("button", { name: /Remove.*Design/i }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["Engineering"], expect.anything());
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox")).toBeDisabled();
  },
};
