import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModelSelectorItem } from "../../../../assistant-ui/elements/ModelSelectorItem.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../../assistant-ui/elements/ModelSelectorList.js";
const meta: Meta<typeof ModelSelectorItem> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorItem",
  component: ModelSelectorItem,
  tags: ["autodocs", "test"],
  args: { model: { id: "reasoning", name: "Reasoning", description: "Detailed work" }, onSelect: fn() },
  render: (args) => (
    <ModelSelectorFixture>
      <ModelSelectorList>
        <ModelSelectorItem {...args} />
      </ModelSelectorList>
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Reasoning Detailed work" }));
    await expect(args.onSelect).toHaveBeenCalledWith("reasoning");
    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
  },
};
export { Default as ModelSelectorItem };
