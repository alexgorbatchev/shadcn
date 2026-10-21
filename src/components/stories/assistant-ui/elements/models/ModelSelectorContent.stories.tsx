import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ModelSelectorContent } from "../../../../assistant-ui/elements/ModelSelectorContent.js";
import { ModelSelectorRoot } from "../../../../assistant-ui/elements/ModelSelectorRoot.js";
import { ModelSelectorTrigger } from "../../../../assistant-ui/elements/ModelSelectorTrigger.js";
const meta: Meta<typeof ModelSelectorContent> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorContent",
  component: ModelSelectorContent,
  tags: ["autodocs", "test"],
  render: (args) => (
    <ModelSelectorRoot models={[{ id: "fast", name: "Fast" }]}>
      <ModelSelectorTrigger aria-label="Choose model" />
      <ModelSelectorContent {...args} />
    </ModelSelectorRoot>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Unfiltered: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Choose model" });
    await userEvent.click(trigger);
    await expect(await within(document.body).findByRole("combobox", { name: "Model" })).toHaveAttribute("readonly");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Filtered: Story = {
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Choose model" }));
    await userEvent.type(await within(document.body).findByRole("combobox", { name: "Model" }), "missing");
    await expect(await within(document.body).findByText("No models found.")).toBeVisible();
  },
};
