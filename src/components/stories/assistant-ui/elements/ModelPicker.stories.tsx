import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModelPicker } from "../../../assistant-ui/elements/ModelPicker.js";

const meta: Meta<typeof ModelPicker> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ModelPicker",
  component: ModelPicker,
  tags: ["autodocs", "test"],
  args: {
    models: [
      { id: "fast", name: "Fast model", family: "General", context: "32K", price: "$0.10", capabilities: ["Text"] },
      {
        id: "reason",
        name: "Reasoning model",
        family: "General",
        context: "128K",
        price: "$1.00",
        capabilities: ["Text", "Vision"],
      },
      { id: "code", name: "Code model", family: "Specialized", context: "64K", price: "$0.50", capabilities: ["Code"] },
    ],
    selectedId: "fast",
    onSelect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Select: Story = {
  render: function Render(args) {
    const [selectedId, setSelectedId] = useState(args.selectedId);
    return (
      <ModelPicker
        {...args}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          args.onSelect?.(id);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const group = within(canvasElement).getByRole("radiogroup", { name: "Models" });
    const initial = within(group).getByRole("radio", { name: "Fast model" });
    await expect(initial).toBeChecked();
    initial.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(group).getByRole("radio", { name: "Reasoning model" })).toBeChecked();
    await expect(args.onSelect).toHaveBeenCalledWith("reason");
    await userEvent.click(within(group).getByRole("radio", { name: "Code model" }));
    await expect(args.onSelect).toHaveBeenLastCalledWith("code");
    await expect(within(group).getByRole("radio", { name: "Code model" })).toBeChecked();
  },
};

export const ReadOnly: Story = {
  args: { onSelect: undefined },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("radiogroup", { name: "Models" });
    await expect(within(group).getByRole("radio", { name: "Fast model" })).toBeChecked();
    await expect(within(group).getByRole("radio", { name: "Reasoning model" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
};

export const Empty: Story = {
  args: { models: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("radio")).not.toBeInTheDocument();
  },
};
