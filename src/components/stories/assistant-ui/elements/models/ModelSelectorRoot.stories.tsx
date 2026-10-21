import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ModelSelectorRoot } from "../../../../assistant-ui/elements/ModelSelectorRoot.js";
import { ModelSelectorTrigger } from "../../../../assistant-ui/elements/ModelSelectorTrigger.js";
import { ModelSelectorContent } from "../../../../assistant-ui/elements/ModelSelectorContent.js";

const meta: Meta<typeof ModelSelectorRoot> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorRoot",
  component: ModelSelectorRoot,
  tags: ["autodocs", "test"],
  args: {
    models: [
      { id: "fast", name: "Fast", description: "Quick responses" },
      { id: "reasoning", name: "Reasoning", description: "Detailed work", efforts: true },
      { id: "unavailable", name: "Unavailable", disabled: true },
    ],
    defaultValue: "fast",
    onValueChange: fn(),
    onEffortChange: fn(),
  },
  render: (args) => (
    <ModelSelectorRoot {...args}>
      <ModelSelectorTrigger aria-label="Choose model" />
      <ModelSelectorContent searchable />
    </ModelSelectorRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Select: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Choose model" }));
    const option = await within(document.body).findByRole("option", { name: "Reasoning Detailed work" });
    await userEvent.click(option);
    await expect(args.onValueChange).toHaveBeenCalledWith("reasoning");
    await expect(within(canvasElement).getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
    await waitFor(() => expect(within(document.body).queryByRole("option")).not.toBeInTheDocument());
  },
};
export const DisabledModel: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Choose model" }));
    const option = await within(document.body).findByRole("option", { name: "Unavailable" });
    await expect(option).toHaveAttribute("aria-disabled", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
  },
};
export const Compact: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("combobox", { name: "Choose model" }).getBoundingClientRect().height,
    ).toBeLessThanOrEqual(28);
  },
};
export const Effort: Story = {
  args: { defaultValue: "reasoning", defaultEffort: "low" },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Choose model" }));
    await userEvent.click(await within(document.body).findByRole("radio", { name: "High" }));
    await expect(args.onEffortChange).toHaveBeenCalledWith("high");
    await expect(within(document.body).getByRole("radio", { name: "High" })).toBeChecked();
    await userEvent.keyboard("{Escape}");
    await expect(within(canvasElement).getByRole("combobox", { name: "Choose model" })).toHaveTextContent("High");
  },
};
