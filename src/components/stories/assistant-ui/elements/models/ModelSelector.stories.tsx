import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModelSelector } from "../../../../assistant-ui/elements/ModelSelector.js";
const meta: Meta<typeof ModelSelector> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelector",
  component: ModelSelector,
  tags: ["autodocs", "test"],
  args: {
    models: [
      { id: "fast", name: "Fast" },
      { id: "reasoning", name: "Reasoning" },
    ],
    onValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("combobox")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(await within(document.body).findByRole("combobox", { name: "Model" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onValueChange).toHaveBeenCalledWith("reasoning");
  },
};
export const Searchable: Story = {
  args: { searchable: true },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    await userEvent.type(await within(document.body).findByRole("combobox", { name: "Model" }), "Reasoning");
    await expect(within(document.body).getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenCalledWith("reasoning");
  },
};
